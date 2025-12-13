'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { FeatureCard } from '@/components/FeatureCard';
import { PlayerList } from '@/components/PlayerList';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { VotingBoardStepper } from '@/components/VotingBoardStepper';
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-4"
        >
          {/* Session Timeline Progress */}
          <VotingBoardStepper
            currentStep={(() => {
              // Determine current step based on voting board flow
              // Step 1: Join - User needs to join the session
              // Step 2: Review - User has joined and should review features
              // Step 3: Ready - User has marked themselves as ready
              // Step 4: Vote - Voting is in progress
              // Step 5: Results - Voting is complete, showing results

              let currentStep: 1 | 2 | 3 | 4 | 5 = 4; // Vote step is active when on this page

              // Check session status
              if (sessionStatus === 'results') {
                currentStep = 5; // Results
              } else if (sessionStatus === 'playing') {
                currentStep = 4; // Vote (current)
              }

              return currentStep;
            })()}
          />

          {/* Header */}
          <div className="space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                {session?.title || session?.project_name || 'Voting Session'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Allocate your {TOTAL_POINTS} points across the features
              </p>
            </div>
          </div>

          {/* Main Content - Single Column Layout */}
          <div className="space-y-4">
            {/* Players Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <ProgressIndicator
                current={votedPlayerIds.size}
                total={players.length}
              />

              <div className="mt-4">
                <PlayerList
                  players={players}
                  votedPlayerIds={votedPlayerIds}
                  showVoteStatus
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-4">
              {/* Points Remaining Card - Enhanced */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Points Display with Circular Progress */}
                  <div className="flex-shrink-0">
                    <div className="relative w-32 h-32">
                      {/* Background Circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-200"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ strokeDashoffset: 352 }}
                          animate={{ strokeDashoffset: 352 - (352 * (TOTAL_POINTS - remainingPoints)) / TOTAL_POINTS }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={
                            remainingPoints < 0
                              ? 'text-red-500'
                              : remainingPoints === 0
                              ? 'text-green-500'
                              : remainingPoints <= 20
                              ? 'text-orange-500'
                              : remainingPoints <= 50
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                          }
                          style={{ strokeDasharray: 352 }}
                        />
                      </svg>
                      {/* Center Text */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                          key={remainingPoints}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          className={`text-3xl font-bold ${
                            remainingPoints < 0
                              ? 'text-red-600'
                              : remainingPoints === 0
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}
                        >
                          {remainingPoints}
                        </motion.div>
                        <div className="text-xs text-gray-500 font-medium">
                          {remainingPoints < 0 ? 'over' : 'left'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info and Quick Actions */}
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Points Budget</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      You have <span className="font-semibold text-gray-900">{TOTAL_POINTS} points</span> to allocate across features.
                      {remainingPoints > 0 && (
                        <span className="block mt-1 text-xs text-amber-600">
                          💡 Tip: Unused points won't count toward your vote
                        </span>
                      )}
                      {remainingPoints === 0 && (
                        <span className="block mt-1 text-xs text-green-600">
                          ✓ Perfect! All points allocated
                        </span>
                      )}
                      {remainingPoints < 0 && (
                        <span className="block mt-1 text-xs text-red-600">
                          ⚠️ You've exceeded the limit by {Math.abs(remainingPoints)} points
                        </span>
                      )}
                    </p>
                  </div>
                </div>
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
                          <p className="text-sm text-amber-900 font-medium">
                            Changed your mind? You have 10 seconds to undo.
                          </p>
                          <Button
                            onClick={handleUndo}
                            variant="secondary"
                            className="!bg-amber-700 hover:!bg-amber-800 !text-white !border-amber-700 whitespace-nowrap"
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
          </div>
        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}
