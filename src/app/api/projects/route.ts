import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        workshops:workshops(count),
        sessions:sessions_unified!sessions_unified_workshop_id_fkey(
          workshop_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Calculate counts
    const projectsWithCounts = projects.map((project) => ({
      ...project,
      workshopCount: project.workshops?.[0]?.count || 0,
      sessionCount: project.sessions?.length || 0,
    }));

    return NextResponse.json({ projects: projectsWithCounts });
  } catch (error) {
    console.error('Error in GET /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, created_by } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Project title is required' },
        { status: 400 }
      );
    }

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        created_by: created_by?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/projects:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
