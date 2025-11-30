'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlayerList } from '@/components/PlayerList';
import { SessionNav } from '@/components/SessionNav';
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
import { LobbyAgenda } from '@/components/LobbyAgenda';
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
        .then(({ data }) => {
          if (data) setFeatures(data);
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

  // Redirect when game starts
  useEffect(() => {
    console.log('[Lobby] Session status changed:', sessionStatus);
    if (sessionStatus === 'playing') {
      console.log('[Lobby] Redirecting to vote page');
      router.push(ROUTES.VOTE(sessionId));
    } else if (sessionStatus === 'results') {
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
          currentPhase="lobby"
          playerInfo={currentPlayer ? {
            name: currentPlayer.name,
            isHost: currentPlayer.is_host,
          } : undefined}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
          {/* Session Goal Banner - Only show if goal exists */}
          {session.session_goal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Session Goal</h3>
                  <p className="text-base text-blue-800">{session.session_goal}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Lobby
            </h1>
            <p className="text-gray-600">Waiting for players to join...</p>
          </div>

          {/* Join Form or Waiting Status */}
          {!currentPlayerId ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Join Session</h2>
              <form onSubmit={handleJoin}>
                <div className="flex gap-3 mb-4">
                  <Input
                    placeholder="Enter your name"
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="text-green-800 font-semibold mb-1">
                    ✓ You've joined the session!
                  </p>
                  <p className="text-sm text-green-700">
                    {isHost
                      ? "You're the host. Start the game when everyone has joined."
                      : "Waiting for the host to start the game. You'll be able to vote once the host starts."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Lobby Agenda/Checklist */}
          <LobbyAgenda
            hasJoined={!!currentPlayerId}
            playerCount={players.length}
            featureCount={features.length}
            isHost={isHost}
            onStartGame={handleStartGame}
          />

          {/* Share Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold mb-3">Invite Others</h2>

            {/* Participant Link - Safe to share */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Participant Link (safe to share)
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={getSessionLink(sessionId)}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <Button onClick={handleCopyLink} variant="secondary">
                  Copy Link
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

                    <div className="flex gap-3">
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

          {/* Features Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Features ({features.length})
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">Locked for voting</span>
              </div>
            </div>
            {features.length > 0 ? (
              <p className="text-sm text-gray-600 mb-4">
                Review these features before voting. Features cannot be changed once voting begins.
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                No features added yet. The host should add features before starting.
              </p>
            )}
            <div className="space-y-2">
              {features.map((feature) => {
                const category = getFeatureCategoryById(feature.category);
                return (
                  <div
                    key={feature.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 flex-1">{feature.title}</p>
                      {category && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${category.badgeClasses}`}>
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </span>
                      )}
                    </div>
                    {feature.description && (
                      <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    )}
                    {(feature.effort !== null || feature.impact !== null) && (
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        {feature.effort !== null && (
                          <span>Effort: {feature.effort}/10</span>
                        )}
                        {feature.impact !== null && (
                          <span>Impact: {feature.impact}/10</span>
                        )}
                      </div>
                    )}
                    {/* Reference Links */}
                    {feature.reference_links && feature.reference_links.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {feature.reference_links.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 hover:border-primary hover:text-primary transition-colors"
                            title={link.title}
                          >
                            <img
                              src={link.favicon}
                              alt=""
                              className="w-3 h-3"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <span>{getLinkTypeIcon(link.type)}</span>
                            <span className="max-w-[120px] truncate">{link.title}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Players List with Ready Toggle */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <PlayerList players={players} showReadyStatus={true} />

            {/* Ready Toggle integrated below player list */}
            {currentPlayerId && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isReady ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {isReady && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {isReady ? 'You are ready!' : 'Mark yourself as ready'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {isReady
                        ? isHost
                          ? 'You can start voting when all players are ready.'
                          : 'Waiting for the host to start the game.'
                        : 'Confirm you have reviewed the features and are ready to vote.'}
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
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Mark as Not Ready
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      I'm Ready to Vote
                    </>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Ready Status Summary - Host only */}
          {isHost && currentPlayerId && (() => {
            const allPlayersReady = players.length > 0 && players.every(p => p.is_ready);
            const readyCount = players.filter(p => p.is_ready).length;
            const notReadyPlayers = players.filter(p => !p.is_ready);

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className={`border rounded-xl p-5 shadow-sm ${
                  allPlayersReady
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {allPlayersReady ? (
                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-1 ${allPlayersReady ? 'text-green-800' : 'text-amber-800'}`}>
                      {allPlayersReady
                        ? '✓ All players are ready!'
                        : `${readyCount} of ${players.length} players ready`}
                    </p>
                    <p className={`text-sm ${allPlayersReady ? 'text-green-700' : 'text-amber-700'}`}>
                      {allPlayersReady
                        ? 'Use the "Begin Voting Round" button in the Session Agenda above to start.'
                        : notReadyPlayers.length > 0 && (
                            <>
                              Waiting for: <span className="font-semibold">{notReadyPlayers.map(p => p.name).join(', ')}</span>
                            </>
                          )}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })()}
        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}
