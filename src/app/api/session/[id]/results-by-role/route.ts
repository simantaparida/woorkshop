import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface RoleFilteredResults {
  featureId: string;
  featureTitle: string;
  featureEffort: number | null;
  featureImpact: number | null;
  totalPoints: number;
  voteCount: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');

    // Build query to get votes with player roles
    let query = supabase
      .from('votes')
      .select(`
        feature_id,
        points_allocated,
        features!inner(id, title, effort, impact),
        players!inner(id, role)
      `)
      .eq('session_id', sessionId);

    // Filter by role if specified
    if (role && role !== 'all') {
      query = query.eq('players.role', role);
    }

    const { data: votesData, error: votesError } = await query;

    if (votesError) {
      console.error('Error fetching role-filtered votes:', votesError);
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      );
    }

    if (!votesData || votesData.length === 0) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    // Aggregate votes by feature
    const featureMap = new Map<string, RoleFilteredResults>();

    votesData.forEach((vote: any) => {
      const featureId = vote.feature_id;
      const feature = vote.features;

      if (!featureMap.has(featureId)) {
        featureMap.set(featureId, {
          featureId,
          featureTitle: feature.title,
          featureEffort: feature.effort,
          featureImpact: feature.impact,
          totalPoints: 0,
          voteCount: 0,
        });
      }

      const existing = featureMap.get(featureId)!;
      existing.totalPoints += vote.points_allocated;
      existing.voteCount += 1;
    });

    // Convert to array and sort by total points
    const results = Array.from(featureMap.values()).sort(
      (a, b) => b.totalPoints - a.totalPoints
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in role-filtered results:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
