import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { ActivityEntry } from '@/types';

// GET /api/recent-activities - Get user's recent activity timeline
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Get limit from query params (default 20, max 100)
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's session IDs
    const { data: userSessions, error: sessionsError } = await supabase
      .from('sessions_unified')
      .select('id, title')
      .eq('created_by', user.id);

    if (sessionsError) {
      console.error('Error fetching user sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    const sessionIds = (userSessions || []).map(s => s.id);
    const sessionTitlesMap = (userSessions || []).reduce((acc, s) => {
      acc[s.id] = s.title;
      return acc;
    }, {} as Record<string, string>);

    if (sessionIds.length === 0) {
      return NextResponse.json({ activities: [] });
    }

    const activities: ActivityEntry[] = [];

    // 1. Fetch player joins
    const { data: playerJoins } = await supabase
      .from('players')
      .select('id, session_id, name, joined_at')
      .in('session_id', sessionIds)
      .order('joined_at', { ascending: false })
      .limit(limit);

    (playerJoins || []).forEach((player: any) => {
      activities.push({
        id: `player_${player.id}`,
        type: 'player_joined',
        message: `${player.name} joined ${sessionTitlesMap[player.session_id] || 'a session'}`,
        user_name: player.name,
        timestamp: player.joined_at,
        session_id: player.session_id,
        session_title: sessionTitlesMap[player.session_id],
      });
    });

    // 2. Fetch statement submissions (Problem Framing)
    const { data: statements } = await supabase
      .from('pf_individual_statements')
      .select('id, session_id, participant_name, submitted_at')
      .in('session_id', sessionIds)
      .order('submitted_at', { ascending: false })
      .limit(limit);

    (statements || []).forEach((stmt: any) => {
      activities.push({
        id: `statement_${stmt.id}`,
        type: 'statement_submitted',
        message: `${stmt.participant_name} submitted a problem statement`,
        user_name: stmt.participant_name,
        timestamp: stmt.submitted_at,
        session_id: stmt.session_id,
        session_title: sessionTitlesMap[stmt.session_id],
      });
    });

    // 3. Fetch pin actions (Problem Framing)
    const { data: pins } = await supabase
      .from('pf_statement_pins')
      .select(`
        id,
        created_at,
        pinned_by_participant_name,
        pf_individual_statements!inner(session_id)
      `)
      .in('pf_individual_statements.session_id', sessionIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    (pins || []).forEach((pin: any) => {
      const sessionId = pin.pf_individual_statements?.session_id;
      activities.push({
        id: `pin_${pin.id}`,
        type: 'pin_added',
        message: `${pin.pinned_by_participant_name} pinned a statement`,
        user_name: pin.pinned_by_participant_name,
        timestamp: pin.created_at,
        session_id: sessionId,
        session_title: sessionTitlesMap[sessionId],
      });
    });

    // 4. Fetch vote submissions (grouped by player to avoid duplication)
    const { data: votes } = await supabase
      .from('votes')
      .select(`
        player_id,
        session_id,
        created_at,
        players!inner(name)
      `)
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Group votes by player_id to get unique vote submissions
    const votesByPlayer = new Map();
    (votes || []).forEach((vote: any) => {
      const key = `${vote.session_id}_${vote.player_id}`;
      if (!votesByPlayer.has(key) || vote.created_at > votesByPlayer.get(key).created_at) {
        votesByPlayer.set(key, vote);
      }
    });

    votesByPlayer.forEach((vote: any) => {
      activities.push({
        id: `vote_${vote.player_id}_${vote.session_id}`,
        type: 'vote_cast',
        message: `${vote.players.name} submitted votes`,
        user_name: vote.players.name,
        timestamp: vote.created_at,
        session_id: vote.session_id,
        session_title: sessionTitlesMap[vote.session_id],
      });
    });

    // 5. Fetch finalizations (Problem Framing)
    const { data: finalizations } = await supabase
      .from('pf_final_statement')
      .select('id, session_id, finalized_by_participant_name, finalized_at')
      .in('session_id', sessionIds)
      .order('finalized_at', { ascending: false })
      .limit(limit);

    (finalizations || []).forEach((final: any) => {
      activities.push({
        id: `final_${final.id}`,
        type: 'finalization',
        message: `${final.finalized_by_participant_name} finalized the problem statement`,
        user_name: final.finalized_by_participant_name,
        timestamp: final.finalized_at,
        session_id: final.session_id,
        session_title: sessionTitlesMap[final.session_id],
      });
    });

    // Sort all activities by timestamp (most recent first) and limit
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({ activities: sortedActivities });
  } catch (error) {
    console.error('Error in GET /api/recent-activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
