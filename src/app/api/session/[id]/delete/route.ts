import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { createApiLogger, logError, logSecurityEvent } from '@/lib/logger';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/session/${params.id}/delete`, 'DELETE');
  const startTime = Date.now();

  try {
    const sessionId = params.id;
    const body = await request.json();
    const { hostToken } = body;

    log.info({ sessionId }, 'Processing session deletion request');

    if (!hostToken) {
      log.warn({ sessionId }, 'Host token not provided');
      return NextResponse.json(
        { error: 'Host token is required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseServer();

    // Verify host token
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('host_token')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      log.warn({ sessionId }, 'Session not found for deletion');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.host_token !== hostToken) {
      logSecurityEvent(log, 'unauthorized_session_deletion_attempt', { sessionId });
      return NextResponse.json(
        { error: 'Unauthorized - invalid host token' },
        { status: 403 }
      );
    }

    // Delete session (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('sessions_unified')
      .delete()
      .eq('id', sessionId);

    if (deleteError) {
      logError(log, deleteError, { sessionId, operation: 'delete_session' });
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({ sessionId, durationMs: duration }, 'Session deleted successfully');

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    );
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
