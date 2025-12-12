'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlayerList } from '@/components/PlayerList';
import { AppLayout } from '@/components/AppLayout';
import { useToast } from '@/components/ui/Toast';
import { useSession } from '@/lib/hooks/useSession';
import { usePlayers } from '@/lib/hooks/usePlayers';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { ROUTES } from '@/lib/constants';
import { supabase } from '@/lib/supabase/client';
import { getFeatureCategoryById } from '@/lib/constants/feature-categories';
import { getLinkTypeIcon } from '@/lib/utils/link-metadata';
import { PLAYER_ROLES } from '@/lib/constants/player-roles';
import type { Feature } from '@/types';

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const { showToast, ToastContainer } = useToast();

  const { session, loading: sessionLoading } = useSession(sessionId);
  const { players, loading: playersLoading } = usePlayers(sessionId);

  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [togglingReady, setTogglingReady] = useState(false);
  const [showHostLink, setShowHostLink] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [timeInLobby, setTimeInLobby] = useState(0);
  const [dismissedJoinMessage, setDismissedJoinMessage] = useState(false);

  const isHost = typeof window !== 'undefined' && localStorage.getItem(`host_token_${sessionId}`) !== null;
  const sessionStatus = session?.status;

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
            // Debug: Check reference_links for each feature
            data.forEach((f: any) => {
              if (f.reference_links) {
                console.log(`Feature "${f.title}":`, {
                  reference_links: f.reference_links,
                  type: typeof f.reference_links,
                  isArray: Array.isArray(f.reference_links),
                  length: Array.isArray(f.reference_links) ? f.reference_links.length : 'N/A'
                });
              }
            });
            setFeatures(data as Feature[]);
          }
        });
    }
  }, [sessionId]);

  // Check if already joined
  useEffect(() => {
    const playerId = localStorage.getItem(`player_id_${sessionId}`);
    if (playerId) {
      setCurrentPlayerId(playerId);
    }
  }, [sessionId]);

  // Sync ready status from players list
  useEffect(() => {
    if (currentPlayerId && players.length > 0) {
      const currentPlayer = players.find(p => p.id === currentPlayerId);
      if (currentPlayer) {
        setIsReady(currentPlayer.is_ready);
      }
    }
  }, [currentPlayerId, players]);

  // Track time spent in lobby
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeInLobby((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Redirect when game starts
  useEffect(() => {
    console.log('[Lobby] Session status changed:', sessionStatus);
    if (sessionStatus === 'playing') {
      console.log('[Lobby] Redirecting to vote page');
      router.push(ROUTES.VOTE(sessionId));
    } else if (sessionStatus === 'results' || sessionStatus === 'completed') {
      console.log('[Lobby] Redirecting to results page');
      router.push(ROUTES.RESULTS(sessionId));
    }
  }, [sessionStatus, router, sessionId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    setJoining(true);

    try {
      const response = await fetch(`/api/session/${sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName,
          role: playerRole || null
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join session');
      }

      localStorage.setItem(`player_id_${sessionId}`, data.playerId);
      setCurrentPlayerId(data.playerId);
      showToast('Joined successfully!', 'success');
    } catch (error) {
      console.error('Error joining session:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to join session',
        'error'
      );
    } finally {
      setJoining(false);
    }
  };

  const handleStartGame = async () => {
    const hostToken = localStorage.getItem(`host_token_${sessionId}`);
    if (!hostToken) {
      showToast('Only the host can start the game', 'error');
      return;
    }

    setStarting(true);

    try {
      const response = await fetch(`/api/session/${sessionId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start game');
      }

      showToast('Game started!', 'success');
      // Redirect to vote page immediately (realtime will also trigger redirect as backup)
      setTimeout(() => {
        router.push(ROUTES.VOTE(sessionId));
      }, 500);
    } catch (error) {
      console.error('Error starting game:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to start game',
        'error'
      );
      setStarting(false);
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

  const handleToggleReady = async () => {
    if (!currentPlayerId) return;

    setTogglingReady(true);

    try {
      const newReadyState = !isReady;

      const response = await fetch(`/api/session/${sessionId}/ready`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: currentPlayerId,
          isReady: newReadyState,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ready status');
      }

      setIsReady(newReadyState);
      showToast(newReadyState ? 'Marked as ready!' : 'Marked as not ready', 'success');
    } catch (error) {
      console.error('Error toggling ready status:', error);
      showToast(
        error instanceof Error ? error.message : 'Failed to update ready status',
        'error'
      );
    } finally {
      setTogglingReady(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Session Not Found</h1>
          <Button onClick={() => router.push(ROUTES.HOME)}>Go Home</Button>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  // Check if game can be started (host only, at least 2 players, all ready, has features)
  const allPlayersReady = players.length > 0 && players.every(p => p.is_ready);
  const canStartGame = isHost && 
                       currentPlayerId && 
                       players.length >= 2 && 
                       allPlayersReady && 
                       features.length > 0;

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
          {(() => {
            // Determine current step based on voting board flow
            // Step 1: Join - User needs to join the session
            // Step 2: Review - User has joined and should review features
            // Step 3: Ready - User has marked themselves as ready
            // Step 4: Vote - Voting is in progress
            // Step 5: Results - Voting is complete, showing results
            
            let currentStep = 1;
            
            // Check session status first
            if (sessionStatus === 'results') {
              currentStep = 5; // Results
            } else if (sessionStatus === 'playing') {
              currentStep = 4; // Vote
            } else if (currentPlayerId) {
              // Step 1 completed: User has joined
              currentStep = 2; // Now on Review step
              
              // Check if features are available to review
              if (features.length > 0) {
                // User can review features, but step 2 is still active until they mark ready
                // If user is ready, they've completed review
                if (isReady) {
                  // Step 2 completed: Features reviewed
                  // Step 3 completed: User is ready
                  currentStep = 3; // Now on Ready step (waiting for host to start voting)
                } else {
                  // Step 2 active: User is reviewing features
                  currentStep = 2;
                }
              } else {
                // No features yet, still on review step (waiting for host to add features)
                currentStep = 2;
              }
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
                className="flex items-center justify-center w-full mb-5"
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
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 border-2 ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600'
                                : isCompleted
                                ? 'bg-green-500 text-white border-green-500'
                                : 'bg-white text-gray-400 border-gray-200'
                            }`}
                          >
                            {isCompleted ? (
                              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              step.id
                            )}
                          </div>
                          <span
                            className={`absolute top-6 text-[9px] font-medium whitespace-nowrap transition-colors duration-300 ${
                              isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>

                        {!isLast && (
                          <div
                            className={`w-10 sm:w-12 h-0.5 mx-1 transition-colors duration-300 ${
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

          {/* Session Goal Banner - Only show if goal exists */}
          {session.session_goal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-semibold text-blue-900 mb-1">Session Goal</h3>
                  <p className="text-sm text-blue-800">{session.session_goal}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div className="space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
                {session.title || session.project_name || 'Voting Session'}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Time in lobby: {formatTime(timeInLobby)}</span>
                </div>
                {currentPlayerId && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isReady ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span>{isReady ? 'You\'re ready' : 'Mark yourself as ready'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Invite Others Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Invite team members
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={getSessionLink(sessionId)}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm font-mono"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Link
                    </Button>
                  </div>
                  <p className="mt-2 text-[10px] sm:text-xs text-gray-500">
                    Share this link with your team to let them join the session
                  </p>
                </div>
              </div>
            </div>

            {/* Start Voting Button - Host Only */}
            {isHost && currentPlayerId && (
              <div className="flex justify-start">
                <Button
                  onClick={handleStartGame}
                  isLoading={starting}
                  disabled={!canStartGame}
                  size="lg"
                  className="w-full sm:w-auto sm:min-w-[200px]"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Begin Voting Round
                </Button>
              </div>
            )}
          </div>

          {/* Join Form or Waiting Status */}
          {!currentPlayerId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-2">Join the Voting Session</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter your details to participate in this voting session
              </p>
              <form onSubmit={handleJoin}>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="Your name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    className="flex-1"
                    required
                  />
                  <select
                    value={playerRole}
                    onChange={(e) => setPlayerRole(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select role (optional)</option>
                    {PLAYER_ROLES.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.icon} {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button type="submit" isLoading={joining} className="w-full">
                  Join Session →
                </Button>
              </form>
            </motion.div>
          ) : (
            <AnimatePresence>
              {!dismissedJoinMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm relative"
                >
                  <button
                    onClick={() => setDismissedJoinMessage(true)}
                    className="absolute top-3 right-3 text-green-600 hover:text-green-800 transition-colors"
                    aria-label="Dismiss message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-start gap-3 pr-6">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-green-800 font-semibold mb-1">
                        ✓ You're in the session!
                  </p>
                  <p className="text-sm text-green-700">
                    {isHost
                          ? "You're the host. Review the features and start voting when everyone is ready."
                          : "Welcome! Review the features below and mark yourself as ready when you're prepared to vote."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
            </AnimatePresence>
          )}

          {/* Session Overview & Players - 2 Column Layout (60:40 ratio) */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">
            {/* Session Details & Features Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
            {session.session_goal && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">{session.session_goal}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Features to Vote On ({features.length})
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">Locked for voting</span>
                </div>
              </div>
              
              {features.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Review these features before voting begins. Once voting starts, features cannot be modified.
                  </p>
                  <div className="space-y-3">
                    {features.map((feature) => {
                      const category = getFeatureCategoryById(feature.category);
                      return (
                        <div
                          key={feature.id}
                          className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 flex-1">{feature.title}</h4>
                            {category && (
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border flex-shrink-0 ${category.badgeClasses}`}>
                                <span>{category.icon}</span>
                                <span>{category.label}</span>
                              </span>
                            )}
                          </div>
                          {feature.description && (
                            <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                          )}
                          {(feature.effort !== null || feature.impact !== null) && (
                            <div className="flex gap-4 mt-2 text-sm text-gray-600">
                              {feature.effort !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Effort:</span>
                                  <span>{feature.effort}/10</span>
                                </span>
                              )}
                              {feature.impact !== null && (
                                <span className="flex items-center gap-1">
                                  <span className="font-medium">Impact:</span>
                                  <span>{feature.impact}/10</span>
                                </span>
                              )}
                            </div>
                          )}
                          {/* Reference Links */}
                          {(() => {
                            // Handle both array and string (JSON) formats, and null/undefined
                            let links = feature.reference_links;
                            
                            // If null or undefined, return empty
                            if (links == null) {
                              return null;
                            }
                            
                            // If it's a string, try to parse it (shouldn't happen with JSONB, but handle it)
                            if (typeof links === 'string') {
                              try {
                                links = JSON.parse(links);
                              } catch (e) {
                                console.warn(`Feature "${feature.title}": Failed to parse reference_links JSON:`, e);
                                return null;
                              }
                            }
                            
                            // Ensure it's an array and has items
                            if (!Array.isArray(links)) {
                              console.warn(`Feature "${feature.title}": reference_links is not an array:`, links);
                              return null;
                            }
                            
                            if (links.length === 0) {
                              return null;
                            }
                            
                            // Filter out any invalid links (must have url)
                            const validLinks = links.filter((link: any) => {
                              return link && typeof link === 'object' && link.url;
                            });
                            
                            if (validLinks.length === 0) {
                              return null;
                            }
                            
                            return (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {validLinks.map((link: any, linkIndex: number) => (
                                  <a
                                    key={linkIndex}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-gray-300 rounded-md text-xs text-gray-700 hover:border-primary hover:text-primary transition-colors"
                                    title={link.title || link.url}
                                  >
                                    {link.favicon && (
                                      <img
                                        src={link.favicon}
                                        alt=""
                                        className="w-3.5 h-3.5"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    )}
                                    {link.type && <span>{getLinkTypeIcon(link.type)}</span>}
                                    <span className="max-w-[120px] truncate">{link.title || link.url}</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                  </a>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">
                    No features added yet. {isHost ? 'Add features before starting the voting round.' : 'The host will add features before starting.'}
                  </p>
                </div>
              )}
            </div>
            </motion.div>

            {/* Players List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col"
            >
            <h3 className="text-[18px] font-medium text-gray-900 mb-3 flex-shrink-0">
              Players ({players.length})
            </h3>

            {/* Everyone Ready Message - Host only */}
            {isHost && currentPlayerId && (() => {
              const allPlayersReady = players.length > 0 && players.every(p => p.is_ready);
              
              if (!allPlayersReady) return null;
              
              return (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-800 font-medium">
                      Everyone is ready. Start the voting round.
                    </p>
                  </div>
                </div>
              );
            })()}

            <PlayerList players={players} showReadyStatus={true} showTitle={false} />

            {/* Ready Toggle integrated below player list */}
            {currentPlayerId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0"
              >
                <div className="flex items-start gap-2.5 mb-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isReady ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {isReady && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 mb-0.5">
                      {isReady ? 'You\'re all set!' : 'Get ready to vote'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {isReady
                        ? isHost
                          ? 'All players need to be ready before you can start voting.'
                          : 'Waiting for the host to begin the voting round.'
                          : 'Review the features above and mark yourself as ready when you\'re prepared to vote.'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleToggleReady}
                  isLoading={togglingReady}
                  variant={isReady ? 'secondary' : 'primary'}
                  size="sm"
                  className="w-full"
                >
                  {isReady ? (
                    <>
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Not Ready
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      I'm Ready to Vote
                    </>
                  )}
                </Button>
              </motion.div>
            )}
            </motion.div>
          </div>

          {/* Invite Others Modal */}
          <AnimatePresence>
            {showInviteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowInviteModal(false)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Invite Others</h2>
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

            {/* Participant Link - Safe to share */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participant Link (safe to share)
              </label>
                  <div className="flex gap-2">
                <input
                  type="text"
                  value={getSessionLink(sessionId)}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                    <Button onClick={handleCopyLink} variant="secondary" size="sm">
                      Copy
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Share this with participants to join the session
              </p>
            </div>

            {/* Host Link - Collapsed by default for safety */}
            {isHost && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowHostLink(!showHostLink)}
                  className="flex items-center justify-between w-full text-left group"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-sm font-medium text-amber-700">
                      Host Link (Advanced)
                    </span>
                  </div>
                  <svg className={`w-4 h-4 text-amber-600 transition-transform ${showHostLink ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showHostLink && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3"
                  >
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-amber-800 mb-1">⚠️ Warning: Do NOT share this link publicly</p>
                          <p className="text-xs text-amber-700">This link grants full host privileges. Only use it to resume your session on another device.</p>
                        </div>
                      </div>
                    </div>

                        <div className="flex gap-2">
                      <input
                        type="text"
                        value={`${getSessionLink(sessionId)}?host=${localStorage.getItem(`host_token_${sessionId}`)}`}
                        readOnly
                        className="flex-1 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm transition-all duration-200 focus:border-amber focus:ring-2 focus:ring-amber/20 font-mono text-xs"
                      />
                      <Button
                        onClick={async () => {
                          const hostLink = `${getSessionLink(sessionId)}?host=${localStorage.getItem(`host_token_${sessionId}`)}`;
                          try {
                            await copyToClipboard(hostLink);
                            showToast('Host link copied! Keep it private.', 'success');
                          } catch {
                            showToast('Failed to copy link', 'error');
                          }
                        }}
                        variant="secondary"
                            size="sm"
                        className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                      >
                        Copy
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
              </div>
            )}
          </AnimatePresence>



        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}

