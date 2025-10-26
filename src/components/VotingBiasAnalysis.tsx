'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { VotingAnalysisResponse, RoleVotingProfile } from '@/app/api/session/[id]/voting-analysis/route';

interface VotingBiasAnalysisProps {
  sessionId: string;
}

const ROLE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Product Manager': { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-900' },
  'Designer': { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-900' },
  'Engineer': { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-900' },
  'Data Analyst': { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-900' },
  'Marketing': { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-900' },
  'Stakeholder': { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-900' },
  'Unknown': { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-900' },
};

function getRoleColor(role: string) {
  return ROLE_COLORS[role] || ROLE_COLORS['Unknown'];
}

function getConsensusLabel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 70) return { label: 'High Consensus', color: 'text-green-700', emoji: '✓' };
  if (score >= 40) return { label: 'Moderate Consensus', color: 'text-yellow-700', emoji: '~' };
  return { label: 'Low Consensus', color: 'text-red-700', emoji: '!' };
}

function getVarianceLabel(variance: number): { label: string; color: string } {
  if (variance < 15) return { label: 'Consistent', color: 'text-green-700' };
  if (variance < 30) return { label: 'Moderate Variance', color: 'text-yellow-700' };
  return { label: 'High Variance', color: 'text-red-700' };
}

export function VotingBiasAnalysis({ sessionId }: VotingBiasAnalysisProps) {
  const [analysis, setAnalysis] = useState<VotingAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true);
        const response = await fetch(`/api/session/${sessionId}/voting-analysis`);

        if (!response.ok) {
          throw new Error('Failed to fetch voting analysis');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err) {
        console.error('Error fetching voting analysis:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Analyzing voting patterns...</span>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-6">
        <p className="text-red-700 text-sm">
          {error || 'Unable to load voting analysis'}
        </p>
      </div>
    );
  }

  if (analysis.roleProfiles.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm font-medium">No voting data available yet</p>
          <p className="text-xs mt-1">Voting patterns will appear once participants start voting</p>
        </div>
      </div>
    );
  }

  const consensus = getConsensusLabel(analysis.consensusScore);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Consensus Score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Team Consensus</h3>
              <p className={`text-2xl font-bold ${consensus.color}`}>
                {Math.round(analysis.consensusScore)}%
              </p>
              <p className="text-xs text-gray-600 mt-1">{consensus.label}</p>
            </div>
            <span className="text-3xl">{consensus.emoji}</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            How much roles agree on top priorities
          </p>
        </motion.div>

        {/* Overall Variance */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Voting Spread</h3>
              <p className={`text-2xl font-bold ${getVarianceLabel(analysis.overallVariance).color}`}>
                ±{Math.round(analysis.overallVariance)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {getVarianceLabel(analysis.overallVariance).label}
              </p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Standard deviation of point allocation
          </p>
        </motion.div>
      </div>

      {/* Role Profiles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Voting Patterns by Role</h3>
        <div className="space-y-4">
          {analysis.roleProfiles
            .sort((a, b) => b.totalVotes - a.totalVotes)
            .map((profile, index) => {
              const roleColor = getRoleColor(profile.role);
              const varianceLabel = getVarianceLabel(profile.votingVariance);

              return (
                <motion.div
                  key={profile.role}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`${roleColor.bg} border ${roleColor.border} rounded-lg p-4`}
                >
                  {/* Role Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className={`font-bold ${roleColor.text}`}>
                        {profile.role}
                      </h4>
                      <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200">
                        {profile.playerCount} {profile.playerCount === 1 ? 'person' : 'people'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Voting Spread</p>
                      <p className={`text-sm font-semibold ${varianceLabel.color}`}>
                        {varianceLabel.label}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <p className="text-xs text-gray-600">Total Votes</p>
                      <p className="text-lg font-bold text-gray-900">{profile.totalVotes}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-gray-200">
                      <p className="text-xs text-gray-600">Avg Points/Feature</p>
                      <p className="text-lg font-bold text-gray-900">
                        {Math.round(profile.averagePointsPerFeature)}
                      </p>
                    </div>
                  </div>

                  {/* Top Features */}
                  {profile.topFeatures.length > 0 && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Top Priorities:
                      </p>
                      <div className="space-y-1.5">
                        {profile.topFeatures.slice(0, 3).map((feature, idx) => (
                          <div
                            key={feature.featureId}
                            className="flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                {idx + 1}
                              </span>
                              <span className="truncate text-gray-900">
                                {feature.featureTitle}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                              <span className="text-gray-600">
                                {feature.voterCount} {feature.voterCount === 1 ? 'vote' : 'votes'}
                              </span>
                              <span className="font-bold text-gray-900">
                                {feature.totalPoints} pts
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
        </div>
      </div>

      {/* Insights */}
      {analysis.roleProfiles.length > 1 && (
        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">💡</span>
            <div>
              <h4 className="text-sm font-semibold text-amber-900 mb-2">Insights</h4>
              <ul className="text-xs text-amber-800 space-y-1">
                {analysis.consensusScore >= 70 && (
                  <li>• Strong alignment across roles - teams are on the same page!</li>
                )}
                {analysis.consensusScore < 40 && (
                  <li>• Low consensus suggests different priorities across roles - consider facilitated discussion.</li>
                )}
                {analysis.overallVariance > 30 && (
                  <li>• High variance indicates diverse opinions - this could spark valuable debates.</li>
                )}
                {analysis.overallVariance < 15 && (
                  <li>• Consistent voting patterns suggest clear, shared understanding.</li>
                )}
                {analysis.roleProfiles.some(p => p.votingVariance > 35) && (
                  <li>• Some roles show internal disagreement - worth exploring why.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
