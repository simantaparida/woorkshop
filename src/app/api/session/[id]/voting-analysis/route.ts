import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export interface VoteWithContext {
  feature_id: string;
  feature_title: string;
  player_id: string;
  player_name: string;
  player_role: string | null;
  points_allocated: number;
}

export interface RoleVotingProfile {
  role: string;
  playerCount: number;
  totalVotes: number;
  averagePointsPerFeature: number;
  topFeatures: Array<{
    featureId: string;
    featureTitle: string;
    totalPoints: number;
    voterCount: number;
  }>;
  votingVariance: number;
}

export interface VotingAnalysisResponse {
  roleProfiles: RoleVotingProfile[];
  overallVariance: number;
  consensusScore: number; // 0-100, how much agreement between roles
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;

    // Fetch all votes with player and feature context
    const { data: votesData, error: votesError } = await supabase
      .from('votes')
      .select(`
        feature_id,
        player_id,
        points_allocated,
        features!inner(title),
        players!inner(name, role)
      `)
      .eq('session_id', sessionId);

    if (votesError) {
      console.error('Error fetching votes:', votesError);
      return NextResponse.json(
        { error: 'Failed to fetch voting data' },
        { status: 500 }
      );
    }

    if (!votesData || votesData.length === 0) {
      return NextResponse.json(
        {
          roleProfiles: [],
          overallVariance: 0,
          consensusScore: 0
        },
        { status: 200 }
      );
    }

    // Transform data to flat structure
    const votesWithContext: VoteWithContext[] = votesData.map((vote: any) => ({
      feature_id: vote.feature_id,
      feature_title: vote.features.title,
      player_id: vote.player_id,
      player_name: vote.players.name,
      player_role: vote.players.role || 'Unknown',
      points_allocated: vote.points_allocated,
    }));

    // Group votes by role
    const votesByRole = votesWithContext.reduce((acc, vote) => {
      const role = vote.player_role || 'Unknown';
      if (!acc[role]) acc[role] = [];
      acc[role].push(vote);
      return acc;
    }, {} as Record<string, VoteWithContext[]>);

    // Calculate role profiles
    const roleProfiles: RoleVotingProfile[] = Object.entries(votesByRole).map(
      ([role, votes]) => {
        // Get unique players in this role
        const uniquePlayers = new Set(votes.map(v => v.player_id));
        const playerCount = uniquePlayers.size;

        // Group votes by feature
        const featureVotes = votes.reduce((acc, vote) => {
          if (!acc[vote.feature_id]) {
            acc[vote.feature_id] = {
              featureTitle: vote.feature_title,
              points: [],
            };
          }
          acc[vote.feature_id].points.push(vote.points_allocated);
          return acc;
        }, {} as Record<string, { featureTitle: string; points: number[] }>);

        // Calculate top features for this role
        const topFeatures = Object.entries(featureVotes)
          .map(([featureId, data]) => ({
            featureId,
            featureTitle: data.featureTitle,
            totalPoints: data.points.reduce((sum, p) => sum + p, 0),
            voterCount: data.points.length,
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .slice(0, 5);

        // Calculate variance (standard deviation of points allocated)
        const allPoints = votes.map(v => v.points_allocated);
        const mean = allPoints.reduce((sum, p) => sum + p, 0) / allPoints.length;
        const variance = Math.sqrt(
          allPoints.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / allPoints.length
        );

        return {
          role,
          playerCount,
          totalVotes: votes.length,
          averagePointsPerFeature: mean,
          topFeatures,
          votingVariance: variance,
        };
      }
    );

    // Calculate overall variance across all roles
    const allPoints = votesWithContext.map(v => v.points_allocated);
    const overallMean = allPoints.reduce((sum, p) => sum + p, 0) / allPoints.length;
    const overallVariance = Math.sqrt(
      allPoints.reduce((sum, p) => sum + Math.pow(p - overallMean, 2), 0) / allPoints.length
    );

    // Calculate consensus score: compare top features across roles
    // Higher score = more agreement on which features are important
    let consensusScore = 0;
    if (roleProfiles.length > 1) {
      const topFeaturesByRole = roleProfiles.map(profile =>
        new Set(profile.topFeatures.map(f => f.featureId))
      );

      // Calculate Jaccard similarity between all pairs of roles
      let totalSimilarity = 0;
      let pairCount = 0;

      for (let i = 0; i < topFeaturesByRole.length; i++) {
        for (let j = i + 1; j < topFeaturesByRole.length; j++) {
          const set1 = topFeaturesByRole[i];
          const set2 = topFeaturesByRole[j];
          const intersection = new Set([...set1].filter(x => set2.has(x)));
          const union = new Set([...set1, ...set2]);
          const similarity = (intersection.size / union.size) * 100;
          totalSimilarity += similarity;
          pairCount++;
        }
      }

      consensusScore = pairCount > 0 ? totalSimilarity / pairCount : 0;
    }

    return NextResponse.json({
      roleProfiles,
      overallVariance,
      consensusScore,
    });
  } catch (error) {
    console.error('Error in voting analysis:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
