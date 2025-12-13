import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { verifySessionAccess, verifySessionOwnership } from '@/lib/utils/auth';
import { createApiLogger, logError } from '@/lib/logger';

// GET /api/sessions/[id] - Get session with context (workshop, project)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/sessions/${params.id}`, 'GET');
  const startTime = Date.now();

  try {
    const { id } = params;

    log.info({ sessionId: id }, 'Fetching session details');

    // Verify user has access to this session (owner or guest with link)
    const { authorized, error: authError } = await verifySessionAccess(id);

    if (!authorized) {
      log.warn({ sessionId: id, reason: authError }, 'Session access denied');
      return NextResponse.json(
        { error: authError || 'Access denied' },
        { status: authError === 'Session not found' ? 404 : 403 }
      );
    }

    const supabase = getSupabaseServer();

    const { data: session, error } = await supabase
      .from('sessions_unified')
      .select(`
        *,
        workshop:workshops(
          id,
          title,
          project:projects(id, title)
        ),
        players(id, name, is_host, created_at),
        features(id, title, description, effort, impact, created_at)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        log.warn({ sessionId: id }, 'Session not found');
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      logError(log, error, { sessionId: id, operation: 'fetch_session' });
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({
      sessionId: id,
      playerCount: session.players?.length || 0,
      featureCount: session.features?.length || 0,
      durationMs: duration
    }, 'Session fetched successfully');

    return NextResponse.json({ session });
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

// PATCH /api/sessions/[id] - Update session
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/sessions/${params.id}`, 'PATCH');
  const startTime = Date.now();

  try {
    const { id } = params;

    log.info({ sessionId: id }, 'Updating session');

    // Verify user owns this session
    const { authorized, error: authError } = await verifySessionOwnership(id);

    if (!authorized) {
      log.warn({ sessionId: id, reason: authError }, 'Session update denied - not owner');
      return NextResponse.json(
        { error: authError || 'Access denied' },
        { status: authError === 'Session not found' ? 404 : 403 }
      );
    }

    const supabase = getSupabaseServer();
    const body = await request.json();
    const { title, description, status, workshop_id, session_config } = body;

    log.debug({
      sessionId: id,
      updates: { title: !!title, description: !!description, status, workshop_id: !!workshop_id }
    }, 'Session update fields');

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: 'Session title cannot be empty' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (status !== undefined) {
      const validStatuses = ['open', 'playing', 'results', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updates.status = status;

      // Set completed_at when status is completed
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (workshop_id !== undefined) {
      // If workshop_id is provided (not null), verify it exists
      if (workshop_id) {
        const { data: workshop, error: workshopError } = await supabase
          .from('workshops')
          .select('id')
          .eq('id', workshop_id)
          .single();

        if (workshopError || !workshop) {
          return NextResponse.json(
            { error: 'Workshop not found' },
            { status: 404 }
          );
        }
      }
      updates.workshop_id = workshop_id;
    }

    if (session_config !== undefined) {
      updates.session_config = session_config;
    }

    const { data: session, error } = await supabase
      .from('sessions_unified')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        log.warn({ sessionId: id }, 'Session not found for update');
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      logError(log, error, { sessionId: id, operation: 'update_session' });
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({
      sessionId: id,
      updatedFields: Object.keys(updates),
      durationMs: duration
    }, 'Session updated successfully');

    return NextResponse.json({ session });
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

// DELETE /api/sessions/[id] - Delete session with cascade
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/sessions/${id}`, 'DELETE');
  const startTime = Date.now();

  try {
    log.info({ sessionId: id }, 'Processing session deletion');

    const supabase = getSupabaseServer();

    // Get authenticated user (for new sessions module)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    log.debug({
      sessionId: id,
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    }, 'Authentication state for deletion');

    // For backward compatibility, also check for hostToken in query params or body
    const { searchParams } = new URL(request.url);
    let hostToken = searchParams.get('host_token');

    if (!hostToken) {
      try {
        const body = await request.json();
        hostToken = body.hostToken;
      } catch {
        // No body, that's okay if we have authenticated user
      }
    }

    // Fetch session to verify ownership
    const { data: session, error: fetchError } = await supabase
      .from('sessions_unified')
      .select('id, host_token, created_by')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        log.warn({ sessionId: id }, 'Session not found for deletion');
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      logError(log, fetchError, { sessionId: id, operation: 'fetch_session_for_delete' });
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    log.debug({
      sessionId: id,
      createdBy: session.created_by,
      hasHostToken: !!session.host_token
    }, 'Session fetched for deletion');

    // Verify authorization: either user owns session OR has valid host token
    const isOwner = user && session.created_by === user.id;
    const hasValidToken = hostToken && session.host_token === hostToken;

    log.debug({
      sessionId: id,
      isOwner,
      hasValidToken,
      authorized: isOwner || hasValidToken
    }, 'Authorization check for deletion');

    if (!isOwner && !hasValidToken) {
      log.warn({
        sessionId: id,
        attemptedBy: user?.id || 'anonymous',
        hasProvidedToken: !!hostToken
      }, 'Unauthorized deletion attempt');
      return NextResponse.json(
        { error: 'Unauthorized to delete this session' },
        { status: 403 }
      );
    }

    // Call cascade delete function
    log.info({ sessionId: id }, 'Calling cascade delete RPC');

    const { data, error: rpcError } = await supabase.rpc('delete_session_cascade', {
      session_id_param: id
    });

    // Handle RPC errors
    if (rpcError) {
      logError(log, rpcError, {
        sessionId: id,
        operation: 'rpc_delete_cascade',
        code: rpcError.code,
        details: rpcError.details
      });

      return NextResponse.json(
        {
          error: 'Failed to delete session',
          debug: process.env.NODE_ENV === 'development' ? {
            rpcError: rpcError.message,
            code: rpcError.code,
          } : undefined,
        },
        { status: 500 }
      );
    }

    // Check if RPC function returned success (new JSONB format)
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        log.error({
          sessionId: id,
          errorStep: data.error_step,
          errorMessage: data.error_message,
          sqlState: data.sql_state,
        }, 'RPC delete function reported failure');

        return NextResponse.json(
          {
            error: 'Failed to delete session',
            debug: process.env.NODE_ENV === 'development' ? {
              step: data.error_step,
              message: data.error_message,
              sqlState: data.sql_state,
            } : undefined,
          },
          { status: 500 }
        );
      }
    }

    // For backward compatibility with old function (returns boolean TRUE)
    if (!data || (typeof data === 'boolean' && !data)) {
      log.error({ sessionId: id, data }, 'RPC returned false or null');
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({
      sessionId: id,
      durationMs: duration
    }, 'Session deleted successfully');

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, {
      sessionId: id,
      durationMs: duration
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
