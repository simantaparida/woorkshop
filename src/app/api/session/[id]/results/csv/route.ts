import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { aggregateVotes, exportToCSV } from '@/lib/utils/helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const supabase = getSupabaseServer();

    // Fetch session
    const { data: session, error: sessionError } = await supabase
      .from('sessions_unified')
      .select('project_name')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch features and votes
    const { data: features } = await supabase
      .from('features')
      .select('*')
      .eq('session_id', sessionId);

    const { data: votes } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId);

    // Aggregate and export
    const results = aggregateVotes(features || [], votes || []);
    const csv = exportToCSV(results);

    const filename = `${session.project_name.replace(/[^a-z0-9]/gi, '_')}_results.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
