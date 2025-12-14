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
    // Use PostgreSQL function for atomic delete + insert operation.
    // This prevents data loss by ensuring both operations succeed or both fail.
    // Migration: 035_add_submit_votes_function.sql

    // Prepare votes in the format expected by the PostgreSQL function
    const votesPayload = votes.map((vote) => ({
      featureId: vote.featureId,
      points: vote.points,
      note: vote.note || null,
    }));

    // Call PostgreSQL function to atomically submit votes
    const { data: result, error: submitError } = await supabase
      .rpc('submit_votes', {
        p_session_id: sessionId,
        p_player_id: playerId,
        p_votes: votesPayload,
      });

    if (submitError) {
      logError(log, submitError, {
        sessionId,
        playerId,
        operation: 'submit_votes',
        voteCount: votes.length,
      });

      return NextResponse.json(
        { error: 'Failed to record votes. Please try again.' },
        { status: 500 }
      );
    }

    log.info({
      sessionId,
      playerId,
      deletedCount: result?.deleted_count,
      insertedCount: result?.inserted_count,
    }, 'Votes submitted successfully via atomic transaction');

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
