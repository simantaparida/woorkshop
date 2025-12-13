import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { createApiLogger, logError } from '@/lib/logger';

/**
 * POST /api/session/{id}/complete
 * Mark a voting board session as completed
 *
 * This endpoint is idempotent - calling it multiple times is safe.
 * Only transitions sessions from 'results' to 'completed'.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/session/${params.id}/complete`, 'POST');
  const startTime = Date.now();

  try {
    const { id: sessionId } = params;
    const supabase = getSupabaseServer();

    log.info({ sessionId }, 'Completing session');

    // Fetch current session state
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('id, status, completed_at, tool_type')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      log.warn({ sessionId }, 'Session not found');
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Idempotency check: if already completed, return success
    if (session.status === 'completed' && session.completed_at) {
      log.info({ sessionId, completedAt: session.completed_at }, 'Session already completed (idempotent)');
      return NextResponse.json({
        success: true,
        message: 'Session already completed',
        completed_at: session.completed_at,
      });
    }

    // Validate status transition: only complete sessions in 'results' status
    // This prevents completing sessions that are still in progress
    if (session.status !== 'results') {
      log.warn({ sessionId, currentStatus: session.status }, 'Invalid status transition to completed');
      return NextResponse.json(
        {
          error: `Cannot complete session with status '${session.status}'. Session must be in 'results' status.`,
        },
        { status: 400 }
      );
    }

    // Mark as completed with timestamp
    const completedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('sessions_unified')
      .update({
        status: 'completed',
        completed_at: completedAt,
      })
      .eq('id', sessionId);

    if (updateError) {
      logError(log, updateError, { sessionId, operation: 'mark_completed' });
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({ sessionId, completedAt, durationMs: duration }, 'Session marked as completed');

    return NextResponse.json({
      success: true,
      completed_at: completedAt,
    });
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
