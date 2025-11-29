import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/sessions/[id] - Get session with context (workshop, project)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: session, error } = await supabase
      .from('sessions_unified')
      .select(`
        *,
        workshop:workshops(
          id,
          title,
          project:projects(id, title)
        ),
        players(id, name, is_host, created_at),
        features(id, title, description, effort, impact, created_at)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching session:', error);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in GET /api/sessions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/sessions/[id] - Update session
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, status, workshop_id, session_config } = body;

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: 'Session title cannot be empty' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (status !== undefined) {
      const validStatuses = ['open', 'playing', 'results', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updates.status = status;

      // Set completed_at when status is completed
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
    }

    if (workshop_id !== undefined) {
      // If workshop_id is provided (not null), verify it exists
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
      updates.workshop_id = workshop_id;
    }

    if (session_config !== undefined) {
      updates.session_config = session_config;
    }

    const { data: session, error } = await supabase
      .from('sessions_unified')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error updating session:', error);
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error in PATCH /api/sessions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const hostToken = searchParams.get('host_token');

    if (!hostToken) {
      return NextResponse.json(
        { error: 'Host token is required' },
        { status: 401 }
      );
    }

    // Verify host token
    const { data: session, error: fetchError } = await supabase
      .from('sessions_unified')
      .select('id, host_token')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching session:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch session' },
        { status: 500 }
      );
    }

    if (session.host_token !== hostToken) {
      return NextResponse.json(
        { error: 'Invalid host token' },
        { status: 403 }
      );
    }

    // Delete session (cascade will handle players, features, votes)
    const { error: deleteError } = await supabase
      .from('sessions_unified')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting session:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/sessions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
