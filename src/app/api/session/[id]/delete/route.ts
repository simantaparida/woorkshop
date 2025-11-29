import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await request.json();
    const { hostToken } = body;

    if (!hostToken) {
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
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.host_token !== hostToken) {
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
      console.error('Session deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
