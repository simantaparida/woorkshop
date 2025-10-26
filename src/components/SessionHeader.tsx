'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { ROUTES } from '@/lib/constants';
import { getSessionGoalById } from '@/lib/constants/session-goals';
import { formatTimeRemaining, isSessionExpired } from '@/lib/constants/session-durations';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { useToast } from './ui/Toast';

interface SessionHeaderProps {
  sessionId?: string;
  sessionName?: string;
  sessionGoal?: string | null;
  expiresAt?: string | null;
  playerName?: string;
  isHost?: boolean;
  showBackButton?: boolean;
}

type Phase = 'lobby' | 'vote' | 'results';

function getPhaseFromPath(pathname: string): Phase {
  if (pathname.includes('/vote')) return 'vote';
  if (pathname.includes('/results')) return 'results';
  return 'lobby';
}

export function SessionHeader({
  sessionId,
  sessionName,
  sessionGoal,
  expiresAt,
  playerName,
  isHost = false,
}: SessionHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast, ToastContainer } = useToast();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const goal = getSessionGoalById(sessionGoal);
  const isExpired = isSessionExpired(expiresAt);
  const timeRemaining = formatTimeRemaining(expiresAt);
  const currentPhase = getPhaseFromPath(pathname);

  const phases: { id: Phase; label: string; icon: string }[] = [
    { id: 'lobby', label: 'Lobby', icon: '👥' },
    { id: 'vote', label: 'Voting', icon: '🗳️' },
    { id: 'results', label: 'Results', icon: '📊' },
  ];

  const handleCopyLink = async () => {
    if (!sessionId) return;
    const link = getSessionLink(sessionId);
    try {
      await copyToClipboard(link);
      showToast('Link copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleLeaveSession = () => {
    setShowLeaveConfirm(false);
    router.push(ROUTES.HOME);
  };

  return (
    <>
      {ToastContainer}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo + Session Info */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              {/* Logo - Non-clickable in session */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
                <span className="font-semibold text-gray-900 hidden sm:block">UX Works</span>
              </div>

              {sessionName && (
                <>
                  <div className="hidden md:block w-px h-6 bg-gray-300 flex-shrink-0" />

                  {/* Session Name + Phase Breadcrumb */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {sessionName}
                      </p>

                      {goal && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${goal.badgeClasses}`}>
                          <span>{goal.icon}</span>
                          <span className="hidden sm:inline">{goal.label}</span>
                        </span>
                      )}
                    </div>

                    {/* Phase Breadcrumb - Desktop */}
                    <div className="hidden md:flex items-center gap-1 mt-1">
                      {phases.map((phase, index) => {
                        const isActive = currentPhase === phase.id;
                        const isPast = phases.findIndex(p => p.id === currentPhase) > index;

                        return (
                          <div key={phase.id} className="flex items-center">
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                                isActive
                                  ? 'bg-primary-100 text-primary-700'
                                  : isPast
                                  ? 'text-gray-500'
                                  : 'text-gray-400'
                              }`}
                            >
                              <span className="text-xs">{phase.icon}</span>
                              <span>{phase.label}</span>
                            </div>
                            {index < phases.length - 1 && (
                              <svg className="w-3 h-3 text-gray-300 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        );
                      })}
                      {expiresAt && (
                        <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                          isExpired
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{timeRemaining}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Share Link Button */}
              {sessionId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="hidden sm:flex"
                  title="Copy session link"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="hidden lg:inline ml-1">Share</span>
                </Button>
              )}

              {/* Player Info */}
              {playerName && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-xs">
                      {playerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xs font-medium text-gray-900">
                      {playerName}
                      {isHost && (
                        <span className="ml-1.5 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full">
                          Host
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Leave Session Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLeaveConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Leave session"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden lg:inline ml-1">Leave</span>
              </Button>
            </div>
          </div>

          {/* Mobile Phase Indicator */}
          <div className="md:hidden mt-3 flex items-center gap-2 overflow-x-auto">
            {phases.map((phase) => {
              const isActive = currentPhase === phase.id;
              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-400'
                  }`}
                >
                  <span>{phase.icon}</span>
                  <span>{phase.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Leave Session?
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to leave this session? You'll need the session link to rejoin.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowLeaveConfirm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleLeaveSession}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                      Leave Session
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
