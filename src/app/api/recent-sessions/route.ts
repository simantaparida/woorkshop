import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getToolPhases } from '@/lib/tools/registry';
import type { ToolType, WorkshopSessionData } from '@/types';

// GET /api/recent-sessions - Get user's recent workshop sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch sessions created by the user with workshop info
    const { data: sessions, error } = await supabase
      .from('sessions_unified')
      .select(`
        id,
        title,
        tool_type,
        status,
        created_at,
        updated_at,
        workshop_id,
        workshops (
          title
        )
      `)
      .eq('created_by', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);

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
        // Get participant count
        const { count: participantCount } = await supabase
          .from('players')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id);

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
          workshop_id: session.workshop_id,
          workshop_title: session.workshops?.title,
          participantCount: participantCount || 0,
          activitiesCompleted,
          totalActivities,
          lastActivity,
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
