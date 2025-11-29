'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ResultsChart } from '@/components/ResultsChart';
import { SessionNav } from '@/components/SessionNav';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { VotingBiasAnalysis } from '@/components/VotingBiasAnalysis';
import { EffortImpactScatter } from '@/components/EffortImpactScatter';
import { RoleFilter } from '@/components/RoleFilter';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { calculateConsensusMetrics, type ConsensusMetrics } from '@/lib/utils/consensus';
import { ROUTES } from '@/lib/constants';
import { getSessionGoalById } from '@/lib/constants/session-goals';
import type { FeatureWithVotes, Session } from '@/types';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const { showToast, ToastContainer } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<FeatureWithVotes[]>([]);
  const [filteredResults, setFilteredResults] = useState<FeatureWithVotes[]>([]);
  const [consensus, setConsensus] = useState<ConsensusMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);

  useEffect(() => {
    if (sessionId) {
      fetchResults();
    }
  }, [sessionId]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/results`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch results');
      }

      setSession(data.session);
      setResults(data.results);
      setFilteredResults(data.results);
      // Calculate consensus metrics
      const metrics = calculateConsensusMetrics(data.results);
      setConsensus(metrics);

      // Fetch available roles
      fetchAvailableRoles();
    } catch (error) {
      console.error('Error fetching results:', error);
      showToast('Failed to load results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/voting-analysis`);
      if (response.ok) {
        const data = await response.json();
        const roles = data.roleProfiles.map((profile: any) => profile.role).filter((r: string) => r !== 'Unknown');
        setAvailableRoles(roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleRoleChange = async (role: string) => {
    setSelectedRole(role);

    if (role === 'all') {
      setFilteredResults(results);
      return;
    }

    try {
      const response = await fetch(`/api/session/${sessionId}/results-by-role?role=${encodeURIComponent(role)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch filtered results');
      }
      const data = await response.json();

      // Convert to FeatureWithVotes format
      const filtered: FeatureWithVotes[] = data.results.map((r: any) => ({
        id: r.featureId,
        session_id: sessionId,
        title: r.featureTitle,
        description: null,
        category: null,
        effort: r.featureEffort,
        impact: r.featureImpact,
        reach: null,
        confidence: null,
        moscow_priority: null,
        user_business_value: null,
        time_criticality: null,
        risk_reduction: null,
        job_size: null,
        reference_links: [],
        created_at: '',
        total_points: r.totalPoints,
        vote_count: r.voteCount,
      }));

      setFilteredResults(filtered);
    } catch (error) {
      console.error('Error fetching filtered results:', error);
      showToast('Failed to filter results by role', 'error');
    }
  };

  const handleCopyLink = async () => {
    const link = getSessionLink(sessionId);
    try {
      await copyToClipboard(link);
      showToast('Link copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/session/${sessionId}/results/csv`);

      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${session?.project_name.replace(/[^a-z0-9]/gi, '_')}_results.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('CSV downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading CSV:', error);
      showToast('Failed to download CSV', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadJSON = () => {
    const exportData = {
      session: {
        id: session?.id,
        projectName: session?.project_name,
        hostName: session?.host_name,
        createdAt: session?.created_at,
      },
      results: results.map((r) => ({
        title: r.title,
        description: r.description,
        effort: r.effort,
        impact: r.impact,
        totalPoints: r.total_points,
        voteCount: r.vote_count,
      })),
      consensus: consensus ? {
        teamAlignment: consensus.teamAlignment,
        consensusLeader: consensus.consensusLeader?.title,
        controversialFeatures: consensus.controversialFeatures.map((f) => f.title),
        unanimousWinners: consensus.unanimousWinners.map((f) => f.title),
      } : null,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session?.project_name.replace(/[^a-z0-9]/gi, '_')}_results.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('JSON downloaded successfully!', 'success');
  };

  const handleDownloadMarkdown = () => {
    let markdown = `# ${session?.project_name} - Results\n\n`;
    markdown += `**Host:** ${session?.host_name}\n\n`;
    markdown += `**Date:** ${new Date(session?.created_at || '').toLocaleDateString()}\n\n`;

    if (consensus) {
      markdown += `## Team Consensus\n\n`;
      markdown += `**Alignment Score:** ${consensus.teamAlignment}%\n\n`;
      if (consensus.consensusLeader) {
        markdown += `**Clear Winner:** ${consensus.consensusLeader.title}\n\n`;
      }
    }

    markdown += `## Results\n\n`;
    markdown += `| Rank | Feature | Points | Votes |\n`;
    markdown += `|------|---------|--------|-------|\n`;

    results.forEach((r, index) => {
      markdown += `| ${index + 1} | ${r.title} | ${r.total_points} | ${r.vote_count} |\n`;
    });

    if (consensus && consensus.controversialFeatures.length > 0) {
      markdown += `\n## Worth Discussing\n\n`;
      consensus.controversialFeatures.forEach((f) => {
        markdown += `- ${f.title}\n`;
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session?.project_name.replace(/[^a-z0-9]/gi, '_')}_results.md`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('Markdown downloaded successfully!', 'success');
  };

  const handleNewSession = () => {
    router.push(ROUTES.CREATE);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-gray-600">Loading results...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
            <Button onClick={() => router.push(ROUTES.HOME)}>Go Home</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SessionNav
          session={{
            id: sessionId,
            title: session.project_name,
            toolType: 'voting-board',
            status: session.status,
          }}
          sessionGoal={session.session_goal}
          expiresAt={session.expires_at}
          currentPhase="results"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Results
            </h1>
            <p className="text-gray-600">Prioritization complete!</p>

              {/* Session Goal Display */}
              {session.session_goal && (() => {
                const goal = getSessionGoalById(session.session_goal);
                return goal ? (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="text-left">
                      <p className="text-xs text-gray-500">Session Focus</p>
                      <p className="text-sm font-semibold text-gray-900">{goal.label}</p>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button onClick={handleCopyLink} variant="secondary">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Link
            </Button>

            {/* Export Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setShowExportMenu(!showExportMenu)}
                variant="secondary"
                isLoading={downloading}
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Results
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {showExportMenu && (
                <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 z-10">
                  <button
                    onClick={() => {
                      handleDownloadCSV();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>📊</span> CSV Format
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadJSON();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>🔧</span> JSON Format
                  </button>
                  <button
                    onClick={() => {
                      handleDownloadMarkdown();
                      setShowExportMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>📝</span> Markdown Format
                  </button>
                </div>
              )}
            </div>

            <Button onClick={handleNewSession} variant="primary">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Session
            </Button>
          </div>

          {/* Role Filter */}
          {availableRoles.length > 0 && results.length > 0 && (
            <RoleFilter
              selectedRole={selectedRole}
              availableRoles={availableRoles}
              onRoleChange={handleRoleChange}
            />
          )}

          {/* Results Visualization */}
          {results.length > 0 ? (
            <ResultsChart results={filteredResults} />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No votes have been submitted yet.</p>
            </div>
          )}

          {/* Voting Bias Analysis - Role-based voting patterns */}
          {results.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">👥</span>
                Voting Patterns by Role
              </h2>
              <VotingBiasAnalysis sessionId={sessionId} />
            </div>
          )}

          {/* Effort vs Impact Scatter Plot */}
          {results.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                Multi-Dimensional Analysis
                {selectedRole !== 'all' && (
                  <span className="text-sm font-normal text-gray-600">
                    (filtered by {selectedRole})
                  </span>
                )}
              </h2>
              <EffortImpactScatter results={filteredResults} />
            </div>
          )}

          {/* Consensus Metrics */}
          {consensus && results.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🤝</span>
                Team Consensus Insights
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                {/* Team Alignment Score */}
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Team Alignment</span>
                      <Tooltip
                        content={
                          <div>
                            <div className="font-semibold mb-1">How is this calculated?</div>
                            <div className="text-xs opacity-90">
                              Measures how concentrated votes are in the top 3 features.
                              <br /><br />
                              Formula: (Points in top 3 ÷ Total points) × 100
                              <br /><br />
                              <strong>70%+</strong> = Strong consensus
                              <br />
                              <strong>40-69%</strong> = Moderate agreement
                              <br />
                              <strong>&lt;40%</strong> = Diverse opinions
                            </div>
                          </div>
                        }
                        position="right"
                      >
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                    <span className={`text-2xl font-bold ${
                      consensus.teamAlignment >= 70 ? 'text-green-600' :
                      consensus.teamAlignment >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {consensus.teamAlignment}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        consensus.teamAlignment >= 70 ? 'bg-green-600' :
                        consensus.teamAlignment >= 40 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${consensus.teamAlignment}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {consensus.teamAlignment >= 70 ? 'Strong consensus on top priorities' :
                     consensus.teamAlignment >= 40 ? 'Moderate agreement among team' :
                     'Diverse opinions, consider discussion'}
                  </p>
                </div>

                {/* Consensus Leader */}
                {consensus.consensusLeader && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🏆</span>
                      <span className="text-sm font-medium text-gray-600">Clear Winner</span>
                      <Tooltip
                        content={
                          <div>
                            <div className="font-semibold mb-1">What does this mean?</div>
                            <div className="text-xs opacity-90">
                              The feature with the highest total points.
                              <br /><br />
                              This indicates the feature that received the most support from the team overall.
                            </div>
                          </div>
                        }
                        position="right"
                      >
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </Tooltip>
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">
                      {consensus.consensusLeader.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {consensus.consensusLeader.total_points} points from {consensus.consensusLeader.vote_count} votes
                    </p>
                  </div>
                )}
              </div>

              {/* Controversial Features */}
              {consensus.controversialFeatures.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚠️</span>
                    <span className="text-sm font-semibold text-gray-900">Worth Discussing</span>
                    <Tooltip
                      content={
                        <div>
                          <div className="font-semibold mb-1">How are these identified?</div>
                          <div className="text-xs opacity-90">
                            Features that received votes from multiple people but with varying amounts of points.
                            <br /><br />
                            This indicates differing opinions on priority. Consider discussing these features to understand different perspectives.
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <button className="text-yellow-600 hover:text-yellow-700 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">These features received mixed votes:</p>
                  <ul className="space-y-1">
                    {consensus.controversialFeatures.map((feature) => (
                      <li key={feature.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                        {feature.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Unanimous Winners */}
              {consensus.unanimousWinners.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">✨</span>
                    <span className="text-sm font-semibold text-gray-900">Broad Agreement</span>
                    <Tooltip
                      content={
                        <div>
                          <div className="font-semibold mb-1">How are these identified?</div>
                          <div className="text-xs opacity-90">
                            Features that received points from a majority of participants (more than 50%).
                            <br /><br />
                            This indicates strong team-wide support. These features are clear priorities with broad buy-in.
                          </div>
                        </div>
                      }
                      position="right"
                    >
                      <button className="text-green-600 hover:text-green-700 transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">These features had strong team support:</p>
                  <ul className="space-y-1">
                    {consensus.unanimousWinners.map((feature) => (
                      <li key={feature.id} className="text-sm text-gray-700 flex items-center gap-2">
                        <span className="w-1 h-1 bg-green-500 rounded-full" />
                        {feature.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {results.length}
              </div>
              <p className="text-gray-600">Features</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {results.reduce((sum, r) => sum + r.vote_count, 0)}
              </div>
              <p className="text-gray-600">Total Votes</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {results.reduce((sum, r) => sum + r.total_points, 0)}
              </div>
              <p className="text-gray-600">Total Points</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 pt-8">
            <p>These results are publicly accessible via the session link</p>
          </div>
        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}
