import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { verifySessionAccess, verifySessionOwnership } from '@/lib/utils/auth';

// GET /api/sessions/[id] - Get session with context (workshop, project)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Verify user has access to this session (owner or guest with link)
    const { authorized, error: authError } = await verifySessionAccess(id);

    if (!authorized) {
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
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching session:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in GET /api/sessions/[id]:', error);
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
  try {
    const { id } = params;

    // Verify user owns this session
    const { authorized, error: authError } = await verifySessionOwnership(id);

    if (!authorized) {
      return NextResponse.json(
        { error: authError || 'Access denied' },
        { status: authError === 'Session not found' ? 404 : 403 }
      );
    }

    const supabase = getSupabaseServer();
    const body = await request.json();
    const { title, description, status, workshop_id, session_config } = body;

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
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error updating session:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in PATCH /api/sessions/[id]:', error);
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
  try {
    const supabase = getSupabaseServer();

    // Get authenticated user (for new sessions module)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    // DEBUG: Log authentication state
    console.log('[DELETE SESSION] Auth state:', {
      sessionId: id,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message,
      timestamp: new Date().toISOString(),
    });

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

    // DEBUG: Log session fetch result
    console.log('[DELETE SESSION] Session fetch:', {
      sessionId: id,
      found: !!session,
      createdBy: session?.created_by,
      hasHostToken: !!session?.host_token,
      hostTokenLength: session?.host_token?.length,
      fetchError: fetchError?.code,
      fetchErrorMessage: fetchError?.message,
      fetchErrorDetails: fetchError?.details,
    });

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching session:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    // Verify authorization: either user owns session OR has valid host token
    const isOwner = user && session.created_by === user.id;
    const hasValidToken = hostToken && session.host_token === hostToken;

    // DEBUG: Log authorization check
    console.log('[DELETE SESSION] Authorization check:', {
      sessionId: id,
      isOwner,
      ownerCheck: {
        hasUser: !!user,
        userId: user?.id,
        createdBy: session.created_by,
        matches: user?.id === session.created_by,
        userIdType: typeof user?.id,
        createdByType: typeof session.created_by,
      },
      hasValidToken,
      tokenCheck: {
        hasProvidedToken: !!hostToken,
        providedTokenLength: hostToken?.length,
        hasSessionToken: !!session.host_token,
        sessionTokenLength: session.host_token?.length,
        tokensMatch: hostToken === session.host_token,
      },
      authorized: isOwner || hasValidToken,
    });

    if (!isOwner && !hasValidToken) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this session' },
        { status: 403 }
      );
    }

    // Call cascade delete function
    console.log('[DELETE SESSION] Calling RPC delete_session_cascade:', {
      sessionId: id,
      timestamp: new Date().toISOString(),
    });

    const { data, error: rpcError } = await supabase.rpc('delete_session_cascade', {
      session_id_param: id
    });

    // DEBUG: Log RPC result
    console.log('[DELETE SESSION] RPC result:', {
      sessionId: id,
      success: !!data,
      data,
      hasError: !!rpcError,
      errorMessage: rpcError?.message,
      errorCode: rpcError?.code,
      errorDetails: rpcError?.details,
      errorHint: rpcError?.hint,
      timestamp: new Date().toISOString(),
    });

    // Handle RPC errors
    if (rpcError) {
      console.error('[DELETE SESSION] RPC call failed:', {
        sessionId: id,
        error: rpcError.message,
        code: rpcError.code,
        details: rpcError.details,
        hint: rpcError.hint,
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
        console.error('[DELETE SESSION] RPC function reported failure:', {
          sessionId: id,
          errorStep: data.error_step,
          errorMessage: data.error_message,
          sqlState: data.sql_state,
        });

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
      console.error('[DELETE SESSION] RPC returned false or null:', {
        sessionId: id,
        data,
      });
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    console.log('[DELETE SESSION] Success:', {
      sessionId: id,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in DELETE /api/sessions/[id]:', {
      sessionId: id,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
