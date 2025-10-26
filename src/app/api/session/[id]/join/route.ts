import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { validatePlayerName, sanitizeString } from '@/lib/utils/validation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const { playerName, role } = await request.json();

    // Validate input
    const nameError = validatePlayerName(playerName);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Check if session exists and is open
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'open') {
      return NextResponse.json(
        { error: 'Session is no longer accepting players' },
        { status: 400 }
      );
    }

    // Check for duplicate name in this session
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('session_id', sessionId)
      .ilike('name', sanitizeString(playerName))
      .single();

    if (existingPlayer) {
      return NextResponse.json(
        { error: 'A player with this name already exists in the session' },
        { status: 409 }
      );
    }

    // Create player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        session_id: sessionId,
        name: sanitizeString(playerName),
        role: role || null,
        is_host: false,
      })
      .select()
      .single();

    if (playerError) {
      console.error('Player creation error:', playerError);
      return NextResponse.json(
        { error: 'Failed to join session' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        playerId: player.id,
        sessionId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
