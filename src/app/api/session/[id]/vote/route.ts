import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { validateVotes } from '@/lib/utils/validation';
import { createApiLogger, logError } from '@/lib/logger';
import type { VoteInput } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Create logger with request context
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/session/${params.id}/vote`, 'POST');

  const startTime = Date.now();

  try {
    const { id: sessionId } = params;
    const { playerId, votes }: VoteInput = await request.json();

    log.info({ sessionId, playerId, voteCount: votes.length }, 'Processing vote submission');

    // Validate input
    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    const votesError = validateVotes(votes);
    if (votesError) {
      return NextResponse.json({ error: votesError }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Verify session is in playing state
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'playing') {
      return NextResponse.json(
        { error: 'Voting is not currently active for this session' },
        { status: 400 }
      );
    }

    // Verify player belongs to this session
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id')
      .eq('id', playerId)
      .eq('session_id', sessionId)
      .single();

    if (playerError || !player) {
      return NextResponse.json(
        { error: 'Player not found in this session' },
        { status: 404 }
      );
    }

    // Verify all features belong to this session
    const { data: features, error: featuresError } = await supabase
      .from('features')
      .select('id')
      .eq('session_id', sessionId);

    if (featuresError || !features) {
      return NextResponse.json({ error: 'Failed to verify features' }, { status: 500 });
    }

    const validFeatureIds = new Set(features.map((f) => f.id));
    const invalidFeatures = votes.filter((v) => !validFeatureIds.has(v.featureId));

    if (invalidFeatures.length > 0) {
      return NextResponse.json(
        { error: 'One or more feature IDs are invalid' },
        { status: 400 }
      );
    }

    // VOTE SUBMISSION STRATEGY:
    // We use delete + insert pattern to handle vote updates.
    // Ideally, this would be in a database transaction, but Supabase JS client
    // doesn't support multi-statement transactions.
    //
    // Alternative approaches for future improvement:
    // 1. Use PostgreSQL function with BEGIN/COMMIT transaction
    // 2. Use upsert with ON CONFLICT, but requires handling zero-point votes differently
    // 3. Fetch existing votes first, calculate diff, then update/insert/delete
    //
    // Current approach: Delete + Insert with error handling

    // Delete existing votes for this player
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .eq('session_id', sessionId)
      .eq('player_id', playerId);

    // Check for delete errors
    if (deleteError) {
      logError(log, deleteError, {
        sessionId,
        playerId,
        operation: 'delete_votes'
      });
      return NextResponse.json(
        { error: 'Failed to clear existing votes' },
        { status: 500 }
      );
    }

    // Prepare new votes (only non-zero votes)
    const voteInserts = votes
      .filter((vote) => vote.points > 0)
      .map((vote) => ({
        session_id: sessionId,
        player_id: playerId,
        feature_id: vote.featureId,
        points_allocated: vote.points,
        note: vote.note || null,
      }));

    // Insert new votes if any
    if (voteInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('votes')
        .insert(voteInserts);

      if (insertError) {
        // CRITICAL: If insert fails after delete, we've lost data
        log.fatal({
          sessionId,
          playerId,
          deletedVotesCount: 'unknown',
          failedInsertCount: voteInserts.length,
          error: insertError.message,
          code: insertError.code,
        }, 'DATA LOSS RISK: Votes were deleted but insert failed');

        return NextResponse.json(
          { error: 'Failed to record votes. Please try again.' },
          { status: 500 }
        );
      }

      log.info({
        sessionId,
        playerId,
        votesRecorded: voteInserts.length
      }, 'Votes recorded successfully');
    }

    // Check if all players have voted
    const { data: allPlayers } = await supabase
      .from('players')
      .select('id')
      .eq('session_id', sessionId);

    const { data: playersWithVotes } = await supabase
      .from('votes')
      .select('player_id')
      .eq('session_id', sessionId);

    const uniqueVoters = new Set(playersWithVotes?.map((v) => v.player_id) || []);
    const allVoted = allPlayers?.every((p) => uniqueVoters.has(p.id));

    log.debug({
      totalPlayers: allPlayers?.length,
      uniqueVoters: uniqueVoters.size,
      allVoted
    }, 'Vote status check');

    // Optionally auto-transition to results when everyone has voted
    if (allVoted && allPlayers && allPlayers.length > 0) {
      log.info({ sessionId }, 'All players have voted, transitioning to results');

      const { error: updateError } = await supabase
        .from('sessions_unified')
        .update({ status: 'results' })
        .eq('id', sessionId);

      if (updateError) {
        logError(log, updateError, {
          sessionId,
          operation: 'auto_transition_to_results'
        });
      } else {
        log.info({ sessionId }, 'Session status updated to results');
      }
    }

    const duration = Date.now() - startTime;
    log.info({ sessionId, playerId, durationMs: duration }, 'Vote submission completed');

    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, {
      sessionId: params.id,
      durationMs: duration
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
