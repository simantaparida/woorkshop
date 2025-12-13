import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { validatePlayerName, sanitizeString } from '@/lib/utils/validation';
import { createApiLogger, logError } from '@/lib/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, `/api/session/${params.id}/join`, 'POST');
  const startTime = Date.now();

  try {
    const { id: sessionId } = params;
    const { playerName, role } = await request.json();

    log.info({ sessionId, playerName, role }, 'Player attempting to join session');

    // Validate input
    const nameError = validatePlayerName(playerName);
    if (nameError) {
      log.warn({ sessionId, playerName, error: nameError }, 'Invalid player name');
      return NextResponse.json({ error: nameError }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    // Check if session exists and is open
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      log.warn({ sessionId }, 'Session not found');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'open') {
      log.warn({ sessionId, status: session.status }, 'Session not accepting players');
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
      log.warn({ sessionId, playerName }, 'Duplicate player name');
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
      logError(log, playerError, { sessionId, playerName, operation: 'create_player' });
      return NextResponse.json(
        { error: 'Failed to join session' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({
      sessionId,
      playerId: player.id,
      playerName: player.name,
      role: player.role,
      durationMs: duration
    }, 'Player joined session successfully');

    return NextResponse.json(
      {
        playerId: player.id,
        sessionId,
      },
      { status: 201 }
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
