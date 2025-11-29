'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PlayerList } from '@/components/PlayerList';
import { SessionBreadcrumb } from '@/components/SessionBreadcrumb';
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
        <SessionBreadcrumb
          sessionId={sessionId}
          sessionName={session.project_name}
          sessionGoal={session.session_goal}
          expiresAt={session.expires_at}
          playerName={currentPlayer?.name}
          isHost={currentPlayer?.is_host}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-8"
        >
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

            {/* Host Link - Only show to host */}
            {isHost && (
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-amber-700 mb-2">
                  Host Link (do not share)
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={`${getSessionLink(sessionId)}?host=${localStorage.getItem(`host_token_${sessionId}`)}`}
                    readOnly
                    className="flex-1 px-3 py-2 bg-amber-50 border border-amber-300 rounded-lg text-sm transition-all duration-200 focus:border-amber focus:ring-2 focus:ring-amber/20"
                  />
                  <Button
                    onClick={async () => {
                      const hostLink = `${getSessionLink(sessionId)}?host=${localStorage.getItem(`host_token_${sessionId}`)}`;
                      try {
                        await copyToClipboard(hostLink);
                        showToast('Host link copied!', 'success');
                      } catch {
                        showToast('Failed to copy link', 'error');
                      }
                    }}
                    variant="secondary"
                    className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300"
                  >
                    Copy Host Link
                  </Button>
                </div>
                <p className="mt-2 text-xs text-amber-700">
                  ⚠️ Keep this private - allows resuming as host
                </p>
              </div>
            )}
          </motion.div>

          {/* Features Preview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">
              Features ({features.length})
            </h2>
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

          {/* Players List */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <PlayerList players={players} showReadyStatus={true} />
          </div>

          {/* Ready Toggle for All Players (including Host) */}
          {currentPlayerId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <p className="text-sm text-gray-700 mb-4">
                {isReady
                  ? isHost
                    ? '✓ You are ready! You can start the game when all players are ready.'
                    : '✓ You are ready! Waiting for the host to start the game...'
                  : 'Mark yourself as ready when you have reviewed the features and are ready to vote.'}
              </p>
              <Button
                onClick={handleToggleReady}
                isLoading={togglingReady}
                variant={isReady ? 'secondary' : 'primary'}
                className="w-full"
              >
                {isReady ? 'Mark as Not Ready' : 'Mark as Ready ✓'}
              </Button>
            </motion.div>
          )}

          {/* Host Actions */}
          {isHost && currentPlayerId && (() => {
            const allPlayersReady = players.length > 0 && players.every(p => p.is_ready);
            const readyCount = players.filter(p => p.is_ready).length;

            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className={`border rounded-xl p-6 shadow-sm ${
                  allPlayersReady
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : 'bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200'
                }`}
              >
                <p className="text-sm mb-2 font-medium">
                  {allPlayersReady
                    ? '✓ All players are ready!'
                    : `⏳ Waiting for players: ${readyCount}/${players.length} ready`}
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  {allPlayersReady
                    ? 'Everyone is ready. You can start the game now!'
                    : 'You can start the game when all players are marked as ready.'}
                </p>
                <Button
                  onClick={handleStartGame}
                  isLoading={starting}
                  disabled={players.length === 0 || !allPlayersReady}
                  className="w-full"
                >
                  {allPlayersReady ? 'Start Game →' : 'Waiting for Players...'}
                </Button>
              </motion.div>
            );
          })()}
        </motion.div>
      </div>
      {ToastContainer}
    </AppLayout>
  );
}
