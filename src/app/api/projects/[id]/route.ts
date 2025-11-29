import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/projects/[id] - Get project with workshops
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        workshops:workshops(
          id,
          title,
          description,
          created_at,
          updated_at,
          sessions:sessions_unified(count)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching project:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      );
    }

    // Calculate session counts for each workshop
    const projectWithCounts = {
      ...project,
      workshops: project.workshops?.map((workshop: any) => ({
        ...workshop,
        sessionCount: workshop.sessions?.[0]?.count || 0,
        sessions: undefined, // Remove sessions array
      })) || [],
    };

    return NextResponse.json({ project: projectWithCounts });
  } catch (error) {
    console.error('Error in GET /api/projects/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description } = body;

    // Build update object
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) {
      if (!title.trim()) {
        return NextResponse.json(
          { error: 'Project title cannot be empty' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error in PATCH /api/projects/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if project exists
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching project:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      );
    }

    // Delete project (cascade will handle workshops and sessions)
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/projects/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
