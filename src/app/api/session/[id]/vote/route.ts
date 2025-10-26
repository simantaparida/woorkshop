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
      .from('sessions')
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

    // Delete existing votes for this player
    await supabase
      .from('votes')
      .delete()
      .eq('session_id', sessionId)
      .eq('player_id', playerId);

    // Insert new votes (only non-zero votes)
    const voteInserts = votes
      .filter((vote) => vote.points > 0)
      .map((vote) => ({
        session_id: sessionId,
        player_id: playerId,
        feature_id: vote.featureId,
        points_allocated: vote.points,
        note: vote.note || null,
      }));

    if (voteInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('votes')
        .insert(voteInserts);

      if (insertError) {
        console.error('Vote insertion error:', insertError);
        return NextResponse.json(
          { error: 'Failed to record votes' },
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

    // Optionally auto-transition to results when everyone has voted
    if (allVoted && allPlayers && allPlayers.length > 0) {
      await supabase
        .from('sessions')
        .update({ status: 'results' })
        .eq('id', sessionId);
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
