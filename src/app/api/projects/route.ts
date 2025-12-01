import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// GET /api/projects - List all projects
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Fetch counts for each project
    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project) => {
        // Count workshops
        const { count: workshopCount } = await supabase
          .from('workshops')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', project.id);

        // Count sessions through workshops
        const { data: workshops } = await supabase
          .from('workshops')
          .select('id')
          .eq('project_id', project.id);

        const workshopIds = workshops?.map(w => w.id) || [];
        let sessionCount = 0;
        
        if (workshopIds.length > 0) {
          const { count } = await supabase
            .from('sessions_unified')
            .select('*', { count: 'exact', head: true })
            .in('workshop_id', workshopIds);
          sessionCount = count || 0;
        }

        return {
          ...project,
          workshopCount: workshopCount || 0,
          sessionCount,
        };
      })
    );

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

    const supabase = getSupabaseServer();
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
