import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/workshops - List workshops (optionally filtered by project_id)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('workshops')
      .select(`
        *,
        project:projects(id, title),
        sessions:sessions_unified(count)
      `)
      .order('created_at', { ascending: false });

    // Filter by project_id if provided
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data: workshops, error } = await query;

    if (error) {
      console.error('Error fetching workshops:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workshops' },
        { status: 500 }
      );
    }

    // Calculate counts
    const workshopsWithCounts = workshops.map((workshop) => ({
      ...workshop,
      sessionCount: workshop.sessions?.[0]?.count || 0,
      sessions: undefined, // Remove sessions array
    }));

    return NextResponse.json({ workshops: workshopsWithCounts });
  } catch (error) {
    console.error('Error in GET /api/workshops:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/workshops - Create a new workshop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, created_by, project_id } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Workshop title is required' },
        { status: 400 }
      );
    }

    // If project_id is provided, verify it exists
    if (project_id) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', project_id)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
    }

    const { data: workshop, error } = await supabase
      .from('workshops')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        created_by: created_by?.trim() || null,
        project_id: project_id || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating workshop:', error);
      return NextResponse.json(
        { error: 'Failed to create workshop' },
        { status: 500 }
      );
    }

    return NextResponse.json({ workshop }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/workshops:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
