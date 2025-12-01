'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { FeatureCard } from '@/components/FeatureCard';
import { PlayerList } from '@/components/PlayerList';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { AppLayout } from '@/components/AppLayout';
import { ImpactEffortGrid } from '@/components/ImpactEffortGrid';
import { useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/components/ui/Tooltip';
import { useSession } from '@/lib/hooks/useSession';
import { usePlayers, usePlayerProgress } from '@/lib/hooks/usePlayers';
import { calculateRemainingPoints } from '@/lib/utils/helpers';
import { ROUTES, TOTAL_POINTS } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import type { Feature } from '@/types';

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const { showToast, ToastContainer } = useToast();

  const { session } = useSession(sessionId);
  const { players } = usePlayers(sessionId);
  const { progress } = usePlayerProgress(sessionId);

  const [features, setFeatures] = useState<Feature[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [showUndoOption, setShowUndoOption] = useState(false);
  const [undoTimeoutId, setUndoTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const remainingPoints = calculateRemainingPoints(TOTAL_POINTS, votes);
  const votedPlayerIds = new Set(progress.filter(p => p.has_voted).map(p => p.player.id));

  // Get current player ID from localStorage (client-side only)
  useEffect(() => {
    const playerId = localStorage.getItem(`player_id_${sessionId}`);
    setCurrentPlayerId(playerId);
  }, [sessionId]);

  // Load features
  useEffect(() => {
    if (sessionId) {
      supabase
        .from('features')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) {
            setFeatures(data);
            // Initialize votes object
            const initialVotes: Record<string, number> = {};
            data.forEach((f) => {
              initialVotes[f.id] = 0;
            });
            setVotes(initialVotes);
          }
        });
    }
  }, [sessionId]);

  // Check if current player has already voted
  useEffect(() => {
    if (currentPlayerId && sessionId) {
      supabase
        .from('votes')
        .select('id')
        .eq('session_id', sessionId)
        .eq('player_id', currentPlayerId)
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setHasSubmitted(true);
          }
        });
    }
  }, [currentPlayerId, sessionId]);

  // Redirect to results when session changes
  useEffect(() => {
    if (session?.status === 'results') {
      router.push(ROUTES.RESULTS(sessionId));
    }
  }, [session?.status, router, sessionId]);

  // Redirect if not playing
  useEffect(() => {
    if (session && session.status !== 'playing') {
      if (session.status === 'open') {
        router.push(ROUTES.LOBBY(sessionId));
      } else if (session.status === 'results') {
        router.push(ROUTES.RESULTS(sessionId));
      }
    }
  }, [session, router, sessionId]);

  const handlePointsChange = (featureId: string, points: number) => {
    setVotes((prev) => ({
      ...prev,
      [featureId]: points,
    }));
  };

  const distributeEvenly = () => {
    const pointsPerFeature = Math.floor(TOTAL_POINTS / features.length);
    const newVotes: Record<string, number> = {};
    features.forEach((f) => {
      newVotes[f.id] = pointsPerFeature;
    });
    setVotes(newVotes);
    showToast('Points distributed evenly', 'success');
  };

  const distributeTopThree = () => {
    if (features.length < 3) {
      showToast('Need at least 3 features for this distribution', 'error');
      return;
    }
    const newVotes: Record<string, number> = {};
    features.forEach((f, index) => {
      if (index === 0) newVotes[f.id] = Math.floor(TOTAL_POINTS * 0.5); // 50%
      else if (index === 1) newVotes[f.id] = Math.floor(TOTAL_POINTS * 0.3); // 30%
      else if (index === 2) newVotes[f.id] = Math.floor(TOTAL_POINTS * 0.2); // 20%
      else newVotes[f.id] = 0;
    });
    setVotes(newVotes);
    showToast('Points distributed to top 3 (50/30/20)', 'success');
  };

  const distributePyramid = () => {
    const newVotes: Record<string, number> = {};
    const totalWeight = features.reduce((sum, _, i) => sum + (features.length - i), 0);
    features.forEach((f, index) => {
      const weight = features.length - index;
      newVotes[f.id] = Math.floor((weight / totalWeight) * TOTAL_POINTS);
    });
    setVotes(newVotes);
    showToast('Points distributed in pyramid style', 'success');
  };

  const clearAllVotes = () => {
    const newVotes: Record<string, number> = {};
    features.forEach((f) => {
      newVotes[f.id] = 0;
    });
    setVotes(newVotes);
    showToast('All votes cleared', 'success');
  };

  const handleSubmit = async () => {
    if (!currentPlayerId) {
      showToast('Please join the session first', 'error');
      return;
    }

    if (remainingPoints < 0) {
      showToast('You have allocated too many points', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const voteArray = Object.entries(votes).map(([featureId, points]) => ({
        featureId,
        points,
      }));

      const response = await fetch(`/api/session/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayerId,
          votes: voteArray,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit votes');
      }

      setHasSubmitted(true);
      setSubmitting(false);
      setShowUndoOption(true);

      // Set a 10-second timer for undo option
      const timeoutId = setTimeout(() => {
        setShowUndoOption(false);
      }, 10000);
      setUndoTimeoutId(timeoutId);

      showToast('Votes submitted successfully!', 'success');
    } catch (error) {
      console.error('Error submitting votes:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to submit votes',
        'error'
      );
      setSubmitting(false);
    }
  };

  const handleUndo = async () => {
    if (!currentPlayerId || !sessionId) return;

    // Clear the timeout if it exists
    if (undoTimeoutId) {
      clearTimeout(undoTimeoutId);
      setUndoTimeoutId(null);
    }

    try {
      // Delete the votes from the database
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('session_id', sessionId)
        .eq('player_id', currentPlayerId);

      if (error) throw error;

      setHasSubmitted(false);
      setShowUndoOption(false);
      showToast('Votes undone. You can vote again.', 'success');
    } catch (error) {
      console.error('Error undoing votes:', error);
      showToast('Failed to undo votes', 'error');
    }
  };

  const currentPlayer = players.find(p => p.id === currentPlayerId);

  if (!currentPlayerId) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-full p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4">Please Join First</h1>
            <p className="text-gray-600 mb-6">
              You need to join the session before you can vote.
            </p>
            <Button onClick={() => router.push(ROUTES.LOBBY(sessionId))}>
              Go to Lobby
            </Button>
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
          className="space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Voting
            </h1>
            <p className="text-gray-600">
              Allocate your {TOTAL_POINTS} points across the features
            </p>
          </div>

            {/* View Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    List View
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Impact vs Effort Grid
                  </div>
                </button>
              </div>
            </div>

          {/* Points Remaining */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-4">
              <div className="text-5xl font-bold mb-2">
                <span className={remainingPoints < 0 ? 'text-red-600' : 'text-primary'}>
                  {remainingPoints}
                </span>
              </div>
              <p className="text-gray-600">
                {remainingPoints < 0 ? 'Points over limit' : 'Points remaining'}
              </p>

              {/* Helper Copy */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  You have <span className="font-semibold text-gray-900">{TOTAL_POINTS} points</span> to allocate across features.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {remainingPoints > 0
                    ? `Tip: Remaining ${remainingPoints} points won't count if not allocated.`
                    : remainingPoints === 0
                    ? 'Perfect! All points allocated.'
                    : "You've exceeded the limit. Please reduce your allocation."}
                </p>
              </div>
            </div>

            {/* Smart Distribution Buttons */}
            {!hasSubmitted && (
              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 mb-2 text-center">Quick actions:</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Tooltip
                    content={
                      <div>
                        <div className="font-semibold mb-1">Even Distribution</div>
                        <div className="text-xs opacity-90">
                          Divides points equally across all {features.length} features.
                          <br />
                          Each feature gets ~{Math.floor(TOTAL_POINTS / features.length)} points.
                        </div>
                      </div>
                    }
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={distributeEvenly}
                      className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      ⚖️ Even
                    </button>
                  </Tooltip>

                  <Tooltip
                    content={
                      <div>
                        <div className="font-semibold mb-1">Top 3 Priority</div>
                        <div className="text-xs opacity-90">
                          Focus on your top 3 features:
                          <br />
                          1st: {Math.floor(TOTAL_POINTS * 0.5)} pts (50%)
                          <br />
                          2nd: {Math.floor(TOTAL_POINTS * 0.3)} pts (30%)
                          <br />
                          3rd: {Math.floor(TOTAL_POINTS * 0.2)} pts (20%)
                        </div>
                      </div>
                    }
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={distributeTopThree}
                      className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      🏆 Top 3
                    </button>
                  </Tooltip>

                  <Tooltip
                    content={
                      <div>
                        <div className="font-semibold mb-1">Pyramid Distribution</div>
                        <div className="text-xs opacity-90">
                          Weighted descending allocation.
                          <br />
                          First feature gets the most, each subsequent feature gets less in a declining pattern.
                        </div>
                      </div>
                    }
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={distributePyramid}
                      className="w-full px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      📊 Pyramid
                    </button>
                  </Tooltip>

                  <Tooltip
                    content={
                      <div>
                        <div className="font-semibold mb-1">Clear All</div>
                        <div className="text-xs opacity-90">
                          Reset all feature allocations to 0 points.
                          <br />
                          Start fresh with your voting.
                        </div>
                      </div>
                    }
                    position="bottom"
                  >
                    <button
                      type="button"
                      onClick={clearAllVotes}
                      className="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      🗑️ Clear
                    </button>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Features */}
            <div className="lg:col-span-2 space-y-4">
              {viewMode === 'grid' ? (
                <ImpactEffortGrid features={features} votes={votes} />
              ) : (
                <>
                  {features.map((feature) => (
                    <FeatureCard
                      key={feature.id}
                      feature={feature}
                      points={votes[feature.id] || 0}
                      remainingPoints={remainingPoints}
                      onPointsChange={handlePointsChange}
                      disabled={hasSubmitted}
                    />
                  ))}
                </>
              )}

              {/* Submit Button */}
              <div className="sticky bottom-4 space-y-3">
                <Button
                  onClick={handleSubmit}
                  disabled={hasSubmitted || remainingPoints < 0}
                  isLoading={submitting}
                  className="w-full py-4 text-lg"
                >
                  {hasSubmitted ? 'Votes Submitted ✓' : 'Submit Votes'}
                </Button>

                {hasSubmitted && (
                  <div className="space-y-3">
                    {/* Undo Option */}
                    {showUndoOption && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-amber-800">
                            Changed your mind? You have 10 seconds to undo.
                          </p>
                          <Button
                            onClick={handleUndo}
                            variant="secondary"
                            className="bg-amber-600 hover:bg-amber-700 text-white border-amber-700 whitespace-nowrap"
                          >
                            Undo Votes
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Vote Status */}
                    <div className="text-center space-y-2">
                      {!showUndoOption && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                          <p className="text-sm font-medium text-green-800">
                            ✓ Votes locked and submitted
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Your votes are final and cannot be changed
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-gray-600">
                        Waiting for others to vote... You'll be redirected automatically when everyone has voted.
                      </p>
                      <Button
                        onClick={() => router.push(ROUTES.RESULTS(sessionId))}
                        variant="secondary"
                        className="w-full"
                      >
                        View Results Now
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
                <ProgressIndicator
                  current={votedPlayerIds.size}
                  total={players.length}
                />

                <div className="mt-6">
                  <PlayerList
                    players={players}
                    votedPlayerIds={votedPlayerIds}
                    showVoteStatus
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}
