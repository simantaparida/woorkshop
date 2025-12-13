import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { validateVotes } from '@/lib/utils/validation';
import type { VoteInput } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const { playerId, votes }: VoteInput = await request.json();

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
      console.error('Vote deletion error:', deleteError);
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
        console.error('Vote insertion error:', insertError);

        // CRITICAL: If insert fails after delete, we've lost data
        // Log this prominently for debugging
        console.error('[DATA LOSS RISK] Votes were deleted but insert failed', {
          sessionId,
          playerId,
          deletedVotesCount: 'unknown',
          failedInsertCount: voteInserts.length,
          error: insertError.message,
          code: insertError.code
        });

        return NextResponse.json(
          { error: 'Failed to record votes. Please try again.' },
          { status: 500 }
        );
      }
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

    console.log('[Vote API] All players:', allPlayers?.length);
    console.log('[Vote API] Unique voters:', uniqueVoters.size);
    console.log('[Vote API] All voted?', allVoted);

    // Optionally auto-transition to results when everyone has voted
    if (allVoted && allPlayers && allPlayers.length > 0) {
      console.log('[Vote API] All players have voted! Updating session status to results...');
      const { error: updateError } = await supabase
        .from('sessions_unified')
        .update({ status: 'results' })
        .eq('id', sessionId);

      if (updateError) {
        console.error('[Vote API] Failed to update session status:', updateError);
      } else {
        console.log('[Vote API] Session status updated to results successfully');
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
