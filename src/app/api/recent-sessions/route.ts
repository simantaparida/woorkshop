import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getToolPhases } from '@/lib/tools/registry';
import type { ToolType, WorkshopSessionData } from '@/types';

// Force this route to be dynamic (not statically generated)
export const dynamic = 'force-dynamic';

// GET /api/recent-sessions - Get user's recent workshop sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch last 5 sessions created by the user (no workshops)
    const { data: sessions, error } = await supabase
      .from('sessions_unified')
      .select('*')
      .eq('created_by', userId)
      .order('updated_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Enrich sessions with participant counts and activity progress
    const enrichedSessions: WorkshopSessionData[] = await Promise.all(
      (sessions || []).map(async (session: any) => {
        // Get participant count based on tool type
        let participantCount = 0;

        if (session.tool_type === 'problem-framing') {
          // For problem framing, count participants from pf_session_participants
          const { count } = await supabase
            .from('pf_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);
          participantCount = count || 0;
        } else {
          // For voting board and other tools, count players
          const { count } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);
          participantCount = count || 0;
        }

        // Calculate activity progress based on tool type and session status
        const toolPhases = getToolPhases(session.tool_type as ToolType);
        const totalActivities = toolPhases.length;
        let activitiesCompleted = 1; // At least first phase (lobby/join) is done
        let lastActivity = toolPhases[0]?.label || 'Started';

        if (session.status === 'playing') {
          activitiesCompleted = 2; // Lobby + current active phase
          lastActivity = toolPhases[1]?.label || 'Active';
        } else if (session.status === 'results' || session.status === 'completed') {
          activitiesCompleted = totalActivities;
          lastActivity = toolPhases[toolPhases.length - 1]?.label || 'Results';
        }

        // Map status to UI-friendly status
        let uiStatus: 'live' | 'paused' | 'completed' = 'paused';
        if (session.status === 'playing') {
          uiStatus = 'live';
        } else if (session.status === 'results' || session.status === 'completed') {
          uiStatus = 'completed';
        }

        return {
          id: session.id,
          title: session.title,
          tool_type: session.tool_type,
          status: uiStatus,
          created_at: session.created_at,
          updated_at: session.updated_at,
          workshop_id: null, // Deprecated - no longer using workshops
          workshop_title: undefined,
          participantCount: participantCount || 0,
          activitiesCompleted,
          totalActivities,
          lastActivity,
          actualStatus: session.status, // Include the actual session status for routing
        };
      })
    );

    return NextResponse.json({ sessions: enrichedSessions });
  } catch (error) {
    console.error('Error in GET /api/recent-sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
