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
      completeSession();
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

  /**
   * Mark session as completed when results page loads
   * This triggers automatically and is idempotent (safe on page refresh)
   */
  const completeSession = async () => {
    try {
      const response = await fetch(`/api/session/${sessionId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        // Log error but don't show to user (non-critical operation)
        const data = await response.json();
        console.warn('Failed to mark session as completed:', data.error);
        return;
      }

      const data = await response.json();
      console.log('Session marked as completed:', data.completed_at);
    } catch (error) {
      // Log error but don't show to user
      console.warn('Error completing session:', error);
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
      a.download = `${(session?.project_name || 'session').replace(/[^a-z0-9]/gi, '_')}_results.csv`;
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
    a.download = `${(session?.project_name || 'session').replace(/[^a-z0-9]/gi, '_')}_results.json`;
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
    a.download = `${(session?.project_name || 'session').replace(/[^a-z0-9]/gi, '_')}_results.md`;
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {session?.title || session?.project_name || 'Results'}
              </h1>
              <p className="text-gray-600 text-sm">✓ Voting complete</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
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

          {/* Results Visualization */}
          {results.length > 0 ? (
            <ResultsChart results={results} />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-600">No votes have been submitted yet.</p>
            </div>
          )}

          {/* Summary Stats & Consensus Metrics */}
          {results.length > 0 && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {results.length}
                    </div>
                    <p className="text-sm text-gray-600">Features</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {results.reduce((sum, r) => sum + r.vote_count, 0)}
                    </div>
                    <p className="text-sm text-gray-600">Votes</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      {results.reduce((sum, r) => sum + r.total_points, 0)}
                    </div>
                    <p className="text-sm text-gray-600">Points</p>
                  </div>
                </div>
              </div>

              {/* Consensus Metrics */}
              {consensus && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Team Consensus</h3>
                  <div className="space-y-4">
                    {/* Team Alignment */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Alignment Score</span>
                        <span className={`text-2xl font-bold ${
                          consensus.teamAlignment >= 70 ? 'text-green-600' :
                          consensus.teamAlignment >= 40 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {consensus.teamAlignment}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${consensus.teamAlignment}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-2 rounded-full ${
                            consensus.teamAlignment >= 70 ? 'bg-green-600' :
                            consensus.teamAlignment >= 40 ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {consensus.teamAlignment >= 70 ? 'Strong alignment on top priorities' :
                         consensus.teamAlignment >= 40 ? 'Moderate team alignment' :
                         'Diverse opinions - discussion recommended'}
                      </p>
                    </div>

                    {/* Consensus Leader */}
                    {consensus.consensusLeader && (
                      <div className="border-t border-gray-100 pt-4">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Top Priority</span>
                        <p className="text-base font-semibold text-gray-900 mt-2">
                          {consensus.consensusLeader.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {consensus.consensusLeader.total_points} points
                          </span>
                          <span>•</span>
                          <span>{consensus.consensusLeader.vote_count} votes</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}
