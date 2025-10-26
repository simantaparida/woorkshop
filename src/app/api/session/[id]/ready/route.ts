import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const { playerId, isReady } = await request.json();

    if (!playerId) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 });
    }

    if (typeof isReady !== 'boolean') {
      return NextResponse.json({ error: 'isReady must be a boolean' }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Verify player exists and belongs to this session
    const { data: player, error: playerError } = await supabase
      .from('players')
      .select('id, session_id')
      .eq('id', playerId)
      .eq('session_id', sessionId)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Update player ready status
    const { error: updateError } = await supabase
      .from('players')
      .update({ is_ready: isReady })
      .eq('id', playerId);

    if (updateError) {
      console.error('Ready status update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update ready status' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, isReady },
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
