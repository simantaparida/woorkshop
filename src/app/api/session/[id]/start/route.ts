import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { createApiLogger, logError } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/session/${params.id}/start`, 'POST');
  const startTime = Date.now();

  try {
    const { id: sessionId } = params;
    const { hostToken } = await request.json();

    log.info({ sessionId }, 'Starting session');

    if (!hostToken) {
      log.warn({ sessionId }, 'Host token not provided');
      return NextResponse.json({ error: 'Host token is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Verify host token
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('id, status, host_token')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      log.warn({ sessionId }, 'Session not found');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.host_token !== hostToken) {
      log.warn({ sessionId }, 'Invalid host token provided');
      return NextResponse.json(
        { error: 'Unauthorized: Invalid host token' },
        { status: 403 }
      );
    }

    if (session.status !== 'open') {
      log.warn({ sessionId, currentStatus: session.status }, 'Session already started');
      return NextResponse.json(
        { error: 'Session has already started' },
        { status: 400 }
      );
    }

    // Check if there's at least one feature
    const { data: features } = await supabase
      .from('features')
      .select('id')
      .eq('session_id', sessionId)
      .limit(1);

    if (!features || features.length === 0) {
      log.warn({ sessionId }, 'Cannot start session without features');
      return NextResponse.json(
        { error: 'Cannot start session without features' },
        { status: 400 }
      );
    }

    // Update session status to 'playing'
    const { error: updateError } = await supabase
      .from('sessions_unified')
      .update({ status: 'playing' })
      .eq('id', sessionId);

    if (updateError) {
      logError(log, updateError, { sessionId, operation: 'update_status' });
      return NextResponse.json(
        { error: 'Failed to start session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({ sessionId, durationMs: duration }, 'Session started successfully');

    return NextResponse.json({ success: true });
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
