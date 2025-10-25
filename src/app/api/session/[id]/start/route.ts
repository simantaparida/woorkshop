import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const { hostToken } = await request.json();

    if (!hostToken) {
      return NextResponse.json({ error: 'Host token is required' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Verify host token
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status, host_token')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.host_token !== hostToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid host token' },
        { status: 403 }
      );
    }

    if (session.status !== 'open') {
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
      return NextResponse.json(
        { error: 'Cannot start session without features' },
        { status: 400 }
      );
    }

    // Update session status to 'playing'
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ status: 'playing' })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Session update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to start session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
