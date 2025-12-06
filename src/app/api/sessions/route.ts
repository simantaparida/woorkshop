import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { getRelativeTime } from '@/lib/utils/date';
import type { SessionListItem, SessionsResponse, ToolType } from '@/types';

// GET /api/sessions - Get user's sessions with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const toolType = searchParams.get('toolType') || 'all';
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build base query
    let query = supabase
      .from('sessions_unified')
      .select('*', { count: 'exact' })
      .eq('created_by', userId);

    // Apply tool type filter
    if (toolType !== 'all') {
      query = query.eq('tool_type', toolType);
    }

    // Apply status filter
    if (status !== 'all') {
      // Map UI status to database status
      const statusMap: Record<string, string[]> = {
        'open': ['open', 'setup'],
        'playing': ['playing', 'input', 'review', 'finalize'],
        'results': ['results', 'summary'],
        'completed': ['completed']
      };

      const dbStatuses = statusMap[status] || [status];
      query = query.in('status', dbStatuses);
    }

    // Apply search filter
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'alphabetical':
        query = query.order('title', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('updated_at', { ascending: false });
        break;
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: sessions, error, count } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    // Enrich sessions with participant counts
    const enrichedSessions: SessionListItem[] = await Promise.all(
      (sessions || []).map(async (session: any) => {
        let participantCount = 0;

        // Get participant count based on tool type
        if (session.tool_type === 'voting-board') {
          const { count } = await supabase
            .from('players')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);
          participantCount = count || 0;
        } else if (session.tool_type === 'problem-framing') {
          const { count } = await supabase
            .from('pf_session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', session.id);
          participantCount = count || 0;
        }

        // Map database status to UI status
        let uiStatus: 'open' | 'playing' | 'results' | 'completed' = 'open';
        if (['playing', 'input', 'review', 'finalize'].includes(session.status)) {
          uiStatus = 'playing';
        } else if (['results', 'summary'].includes(session.status)) {
          uiStatus = 'results';
        } else if (session.status === 'completed') {
          uiStatus = 'completed';
        }

        // Calculate relative time
        const lastActivityTime = getRelativeTime(session.updated_at);

        return {
          id: session.id,
          title: session.title,
          description: session.description,
          tool_type: session.tool_type,
          status: uiStatus,
          created_at: session.created_at,
          updated_at: session.updated_at,
          completed_at: session.completed_at,
          participantCount,
          lastActivityTime,
        };
      })
    );

    const response: SessionsResponse = {
      sessions: enrichedSessions,
      total: count || 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
