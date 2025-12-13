import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { createApiLogger, logError } from '@/lib/logger';

// GET /api/workshops - List workshops
export async function GET(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, '/api/workshops', 'GET');
  const startTime = Date.now();

  try {
    log.info('Fetching workshops list');

    const supabase = getSupabaseServer();
    const { data: workshops, error } = await supabase
      .from('workshops')
      .select(`
        *,
        sessions:sessions_unified(count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      logError(log, error, { operation: 'fetch_workshops' });
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

    const duration = Date.now() - startTime;
    log.info({ workshopCount: workshopsWithCounts.length, durationMs: duration }, 'Workshops fetched successfully');

    return NextResponse.json({ workshops: workshopsWithCounts });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, { durationMs: duration });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/workshops - Create a new workshop
export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';
  const log = createApiLogger(requestId, '/api/workshops', 'POST');
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { title, description, created_by } = body;

    log.info({ title, hasDescription: !!description, createdBy: created_by }, 'Creating new workshop');

    // Validation
    if (!title || !title.trim()) {
      log.warn('Workshop title not provided');
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
      logError(log, error, { title, operation: 'create_workshop' });
      return NextResponse.json(
        { error: 'Failed to create workshop' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    log.info({ workshopId: workshop.id, title: workshop.title, durationMs: duration }, 'Workshop created successfully');

    return NextResponse.json({ workshop }, { status: 201 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(log, error, { durationMs: duration });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
