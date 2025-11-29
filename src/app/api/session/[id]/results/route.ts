import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { aggregateVotes } from '@/lib/utils/helpers';

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
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch features
    const { data: features, error: featuresError } = await supabase
      .from('features')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (featuresError) {
      return NextResponse.json(
        { error: 'Failed to fetch features' },
        { status: 500 }
      );
    }

    // Fetch votes
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('*')
      .eq('session_id', sessionId);

    if (votesError) {
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      );
    }

    // Aggregate results
    const results = aggregateVotes(features || [], votes || []);

    return NextResponse.json({
      session,
      results,
      totalVotes: votes?.length || 0,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
