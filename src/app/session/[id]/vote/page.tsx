'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { FeatureCard } from '@/components/FeatureCard';
import { PlayerList } from '@/components/PlayerList';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { AppLayout } from '@/components/AppLayout';
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
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching features:', error);
            return;
          }
          if (data) {
            // Debug: Log reference links for each feature
            data.forEach((f: any) => {
              if (f.reference_links) {
                console.log(`Vote Page - Feature "${f.title}":`, {
                  reference_links: f.reference_links,
                  type: typeof f.reference_links,
                  isArray: Array.isArray(f.reference_links),
                  length: Array.isArray(f.reference_links) ? f.reference_links.length : 'N/A'
                });
              }
            });
            setFeatures(data as Feature[]);
            // Initialize votes object
            const initialVotes: Record<string, number> = {};
            data.forEach((f: any) => {
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
    if (session?.status === 'results' || session?.status === 'completed') {
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

  const sessionStatus = session?.status;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          {/* Session Timeline Progress */}
          {(() => {
            // Determine current step based on voting board flow
            // Step 1: Join - User needs to join the session
            // Step 2: Review - User has joined and should review features
            // Step 3: Ready - User has marked themselves as ready
            // Step 4: Vote - Voting is in progress
            // Step 5: Results - Voting is complete, showing results
            
            let currentStep = 4; // Vote step is active when on this page
            
            // Check session status
            if (sessionStatus === 'results') {
              currentStep = 5; // Results
            } else if (sessionStatus === 'playing') {
              currentStep = 4; // Vote (current)
            }

            const steps = [
              { id: 1, label: 'Join' },
              { id: 2, label: 'Review' },
              { id: 3, label: 'Ready' },
              { id: 4, label: 'Vote' },
              { id: 5, label: 'Results' },
            ];

            return (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="flex items-center justify-center w-full mb-8"
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
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {session?.title || session?.project_name || 'Voting Session'}
              </h1>
              <p className="text-gray-600">
                Allocate your {TOTAL_POINTS} points across the features
              </p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6 items-start">
            {/* Left Column - Features */}
            <div className="space-y-6">
              {/* Points Remaining Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
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

              {/* Features List */}
              <div className="space-y-4">
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
              </div>

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

            {/* Right Sidebar - Players */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-4">
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
