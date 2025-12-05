import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

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
  try {
    const { id: sessionId } = params;
    const supabase = getSupabaseServer();

    // Fetch current session state
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('id, status, completed_at, tool_type')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Idempotency check: if already completed, return success
    if (session.status === 'completed' && session.completed_at) {
      return NextResponse.json({
        success: true,
        message: 'Session already completed',
        completed_at: session.completed_at,
      });
    }

    // Validate status transition: only complete sessions in 'results' status
    // This prevents completing sessions that are still in progress
    if (session.status !== 'results') {
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
      console.error('Session completion error:', updateError);
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      completed_at: completedAt,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
