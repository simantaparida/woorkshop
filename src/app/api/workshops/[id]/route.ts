import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { getToolPhases } from '@/lib/tools/registry';
import type { ToolType } from '@/types';
import { createApiLogger, logError } from '@/lib/logger';

// GET /api/workshops/[id] - Get workshop with sessions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/workshops/${params.id}`, 'GET');
  const startTime = Date.now();

  try {
    const { id } = params;
    const supabase = getSupabaseServer();

    log.info({ workshopId: id }, 'Fetching workshop details');

    const { data: workshop, error } = await supabase
      .from('workshops')
      .select(`
        *,
        sessions:sessions_unified(
          id,
          title,
          description,
          tool_type,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        log.warn({ workshopId: id }, 'Workshop not found');
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      logError(log, error, { workshopId: id, operation: 'fetch_workshop' });
      return NextResponse.json(
        { error: 'Failed to fetch workshop' },
        { status: 500 }
      );
    }

    // Enrich sessions with participant counts and activity progress
    if (workshop.sessions && workshop.sessions.length > 0) {
      const enrichedSessions = await Promise.all(
        workshop.sessions.map(async (session: any) => {
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
          } else if (session.status === 'results') {
            activitiesCompleted = totalActivities;
            lastActivity = toolPhases[toolPhases.length - 1]?.label || 'Results';
          }

          return {
            ...session,
            participantCount: participantCount || 0,
            activitiesCompleted,
            totalActivities,
            lastActivity,
          };
        })
      );

      workshop.sessions = enrichedSessions;
    }

    const duration = Date.now() - startTime;
    log.info({
      workshopId: id,
      sessionCount: workshop.sessions?.length || 0,
      durationMs: duration
    }, 'Workshop fetched successfully');

    return NextResponse.json({ workshop });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, {
      workshopId: params.id,
      durationMs: duration
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/workshops/[id] - Update workshop
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/workshops/${params.id}`, 'PATCH');
  const startTime = Date.now();

  try {
    const { id } = params;
    const body = await request.json();
    const { title, description } = body;

    log.info({ workshopId: id, updates: { title: !!title, description: !!description } }, 'Updating workshop');

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      if (!title.trim()) {
        log.warn({ workshopId: id }, 'Workshop title cannot be empty');
        return NextResponse.json(
          { error: 'Workshop title cannot be empty' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    const supabase = getSupabaseServer();
    const { data: workshop, error } = await supabase
      .from('workshops')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        log.warn({ workshopId: id }, 'Workshop not found for update');
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      logError(log, error, { workshopId: id, operation: 'update_workshop' });
      return NextResponse.json(
        { error: 'Failed to update workshop' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({ workshopId: id, updatedFields: Object.keys(updates), durationMs: duration }, 'Workshop updated successfully');

    return NextResponse.json({ workshop });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, {
      workshopId: params.id,
      durationMs: duration
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/workshops/[id] - Delete workshop
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/workshops/${params.id}`, 'DELETE');
  const startTime = Date.now();

  try {
    const { id } = params;

    log.info({ workshopId: id }, 'Deleting workshop');

    // Check if workshop exists
    const supabase = getSupabaseServer();
    const { data: workshop, error: fetchError } = await supabase
      .from('workshops')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        log.warn({ workshopId: id }, 'Workshop not found for deletion');
        return NextResponse.json(
          { error: 'Workshop not found' },
          { status: 404 }
        );
      }
      logError(log, fetchError, { workshopId: id, operation: 'fetch_workshop_for_delete' });
      return NextResponse.json(
        { error: 'Failed to fetch workshop' },
        { status: 500 }
      );
    }

    // Delete workshop (cascade will handle sessions)
    const { error: deleteError } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logError(log, deleteError, { workshopId: id, operation: 'delete_workshop' });
      return NextResponse.json(
        { error: 'Failed to delete workshop' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({ workshopId: id, durationMs: duration }, 'Workshop deleted successfully');

    return NextResponse.json({ success: true });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, {
      workshopId: params.id,
      durationMs: duration
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
