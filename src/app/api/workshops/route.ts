import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';

// GET /api/workshops - List workshops
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const { data: workshops, error } = await supabase
      .from('workshops')
      .select(`
        *,
        sessions:sessions_unified(count)
      `)
      .order('created_at', { ascending: false });

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
    const { title, description, created_by } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Workshop title is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServer();
    const { data: workshop, error } = await supabase
      .from('workshops')
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        created_by: created_by?.trim() || null,
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
