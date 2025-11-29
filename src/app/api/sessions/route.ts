import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';
import type { ToolType } from '@/types';

// GET /api/sessions - List sessions (optionally filtered by workshop_id or tool_type)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workshopId = searchParams.get('workshop_id');
    const toolType = searchParams.get('tool_type');

    let query = supabase
      .from('sessions_unified')
      .select(`
        *,
        workshop:workshops(id, title, project:projects(id, title))
      `)
      .order('created_at', { ascending: false });

    // Filter by workshop_id if provided
    if (workshopId) {
      query = query.eq('workshop_id', workshopId);
    }

    // Filter by tool_type if provided
    if (toolType) {
      query = query.eq('tool_type', toolType);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error in GET /api/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      created_by,
      workshop_id,
      tool_type = 'voting-board',
      session_config = {},
      host_name,
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Session title is required' },
        { status: 400 }
      );
    }

    if (!host_name || !host_name.trim()) {
      return NextResponse.json(
        { error: 'Host name is required' },
        { status: 400 }
      );
    }

    // Validate tool_type
    const validToolTypes: ToolType[] = ['problem-framing', 'voting-board', 'rice', 'moscow'];
    if (!validToolTypes.includes(tool_type)) {
      return NextResponse.json(
        { error: 'Invalid tool type' },
        { status: 400 }
      );
    }

    // If workshop_id is provided, verify it exists
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

    // Generate host token
    const hostToken = nanoid(32);

    // Create session
    const { data: session, error } = await supabase
      .from('sessions_unified')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        created_by: created_by?.trim() || null,
        workshop_id: workshop_id || null,
        tool_type,
        session_config,
        status: 'open',
        host_token: hostToken,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating session:', error);
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Create host player
    const { data: player, error: playerError } = await supabase
      .from('players')
      .insert({
        session_id: session.id,
        name: host_name.trim(),
        is_host: true,
      })
      .select()
      .single();

    if (playerError) {
      console.error('Error creating host player:', playerError);
      // Rollback session creation
      await supabase.from('sessions_unified').delete().eq('id', session.id);
      return NextResponse.json(
        { error: 'Failed to create host player' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        session,
        sessionId: session.id,
        hostToken,
        playerId: player.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
