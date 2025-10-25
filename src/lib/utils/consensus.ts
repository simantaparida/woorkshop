import type { FeatureWithVotes } from '@/types';

export interface ConsensusMetrics {
  teamAlignment: number; // 0-100 score
  consensusLeader: FeatureWithVotes | null;
  controversialFeatures: FeatureWithVotes[];
  unanimousWinners: FeatureWithVotes[];
}

/**
 * Calculate team alignment score based on vote distribution
 * High score = most people agree on top features
 * Low score = votes are spread out/controversial
 */
export function calculateConsensusMetrics(
  results: FeatureWithVotes[]
): ConsensusMetrics {
  if (results.length === 0) {
    return {
      teamAlignment: 0,
      consensusLeader: null,
      controversialFeatures: [],
      unanimousWinners: [],
    };
  }

  // Sort by total points descending
  const sorted = [...results].sort((a, b) => b.total_points - a.total_points);

  // Calculate team alignment score
  // Based on how concentrated the votes are on top features
  const totalPoints = sorted.reduce((sum, r) => sum + r.total_points, 0);
  const top3Points = sorted.slice(0, 3).reduce((sum, r) => sum + r.total_points, 0);
  const concentration = totalPoints > 0 ? (top3Points / totalPoints) : 0;
  const teamAlignment = Math.round(concentration * 100);

  // Consensus leader: feature with most points and votes
  const consensusLeader = sorted[0];

  // Controversial features: features with votes but not leading
  // (Many people voted but points are spread out)
  const avgVoteCount = results.reduce((sum, r) => sum + r.vote_count, 0) / results.length;
  const avgPoints = totalPoints / results.length;

  const controversialFeatures = results.filter((r) => {
    // High vote count but lower than average points suggests disagreement
    const hasHighEngagement = r.vote_count > avgVoteCount;
    const hasLowerPoints = r.total_points < avgPoints;
    return hasHighEngagement && hasLowerPoints;
  }).slice(0, 3); // Top 3 most controversial

  // Unanimous winners: features where everyone voted (if vote_count equals total players)
  // For now, we'll consider features with very high vote count relative to points
  const unanimousWinners = results.filter((r) => {
    // Features where vote count is close to or exceeds points indicate many small votes
    // vs a few large votes - suggests broad agreement
    return r.vote_count >= r.total_points * 0.8 && r.total_points > avgPoints;
  });

  return {
    teamAlignment,
    consensusLeader: consensusLeader || null,
    controversialFeatures,
    unanimousWinners,
  };
}
