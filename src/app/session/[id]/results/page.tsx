'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ResultsChart } from '@/components/ResultsChart';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/components/ui/Toast';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { calculateConsensusMetrics, type ConsensusMetrics } from '@/lib/utils/consensus';
import { ROUTES } from '@/lib/constants';
import type { FeatureWithVotes, Session } from '@/types';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const { showToast, ToastContainer } = useToast();

  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<FeatureWithVotes[]>([]);
  const [consensus, setConsensus] = useState<ConsensusMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

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
      // Calculate consensus metrics
      const metrics = calculateConsensusMetrics(data.results);
      setConsensus(metrics);
    } catch (error) {
      console.error('Error fetching results:', error);
      showToast('Failed to load results', 'error');
    } finally {
      setLoading(false);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-6"
        >
          {/* Session Timeline Progress */}
          {(() => {
            const currentStep = 6; // Results step is active
            const steps = [
              { id: 1, label: 'Create' },
              { id: 2, label: 'Join' },
              { id: 3, label: 'Review' },
              { id: 4, label: 'Ready' },
              { id: 5, label: 'Vote' },
              { id: 6, label: 'Results' },
            ];

            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center justify-center w-full mb-6"
              >
                <div className="flex items-center relative z-10">
                  {steps.map((step, index) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;
                    const isLast = index === steps.length - 1;

                    return (
                      <div key={step.id} className="flex items-center">
                        <div className="flex flex-col items-center relative">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 border-2 ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                                : isCompleted
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-400 border-gray-200'
                            }`}
                          >
                            {isCompleted ? (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              step.id
                            )}
                          </div>
                          <span
                            className={`absolute top-8 text-[10px] font-medium whitespace-nowrap transition-colors duration-300 ${
                              isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>

                        {!isLast && (
                          <div
                            className={`w-12 sm:w-16 h-0.5 mx-1.5 transition-colors duration-300 ${
                              isCompleted ? 'bg-green-500' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })()}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {session?.title || session?.project_name || 'Results'}
              </h1>
              <p className="text-gray-600 text-sm">Voting complete</p>
            </div>

            {/* Compact Actions */}
            <div className="flex gap-2">
              <Button onClick={handleCopyLink} variant="secondary" size="sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </Button>

              {/* Export Dropdown */}
              <div className="relative">
                <Button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  variant="secondary"
                  size="sm"
                  isLoading={downloading}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export
                  <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Button>

                {showExportMenu && (
                  <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-40 z-10">
                    <button
                      onClick={() => {
                        handleDownloadCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>📊</span> CSV
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadJSON();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>🔧</span> JSON
                    </button>
                    <button
                      onClick={() => {
                        handleDownloadMarkdown();
                        setShowExportMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <span>📝</span> Markdown
                    </button>
                  </div>
                )}
              </div>

              <Button onClick={handleNewSession} variant="primary" size="sm">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Session
              </Button>
            </div>
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

          {/* Results Visualization */}
          {results.length > 0 ? (
            <ResultsChart results={results} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No votes have been submitted yet.</p>
            </div>
          )}

          {/* Compact Consensus Metrics */}
          {consensus && results.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Team Alignment */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Team Alignment</span>
                    <span className={`text-xl font-bold ${
                      consensus.teamAlignment >= 70 ? 'text-green-600' :
                      consensus.teamAlignment >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {consensus.teamAlignment}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        consensus.teamAlignment >= 70 ? 'bg-green-600' :
                        consensus.teamAlignment >= 40 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${consensus.teamAlignment}%` }}
                    />
                  </div>
                </div>

                {/* Consensus Leader */}
                {consensus.consensusLeader && (
                  <div>
                    <span className="text-xs text-gray-500">Top Priority</span>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {consensus.consensusLeader.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {consensus.consensusLeader.total_points} pts • {consensus.consensusLeader.vote_count} votes
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compact Summary Stats */}
          {results.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {results.length}
                </div>
                <p className="text-xs text-gray-600">Features</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {results.reduce((sum, r) => sum + r.vote_count, 0)}
                </div>
                <p className="text-xs text-gray-600">Votes</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {results.reduce((sum, r) => sum + r.total_points, 0)}
                </div>
                <p className="text-xs text-gray-600">Points</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}
