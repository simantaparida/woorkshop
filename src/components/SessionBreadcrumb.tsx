'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/Button';
import { ROUTES } from '@/lib/constants';
import { getSessionGoalById } from '@/lib/constants/session-goals';
import { formatTimeRemaining, isSessionExpired } from '@/lib/constants/session-durations';
import { copyToClipboard, getSessionLink } from '@/lib/utils/helpers';
import { useToast } from './ui/Toast';

interface SessionBreadcrumbProps {
  sessionId?: string;
  sessionName?: string;
  sessionGoal?: string | null;
  expiresAt?: string | null;
  playerName?: string;
  isHost?: boolean;
}

type Phase = 'lobby' | 'vote' | 'results';

function getPhaseFromPath(pathname: string): Phase {
  if (pathname.includes('/vote')) return 'vote';
  if (pathname.includes('/results')) return 'results';
  return 'lobby';
}

export function SessionBreadcrumb({
  sessionId,
  sessionName,
  sessionGoal,
  expiresAt,
  playerName,
  isHost = false,
}: SessionBreadcrumbProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

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

  if (!sessionId || !sessionName) return null;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
      <div className="max-w-7xl mx-auto">
        {/* Session Info Row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {sessionName}
            </h2>
            {goal && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${goal.badgeClasses}`}>
                <span>{goal.icon}</span>
                <span className="hidden sm:inline">{goal.label}</span>
              </span>
            )}
            {expiresAt && (
              <span className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
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

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Share Link Button */}
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
              onClick={() => router.push(ROUTES.HOME)}
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

        {/* Phase Breadcrumb */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {phases.map((phase, index) => {
            const isActive = currentPhase === phase.id;
            const isPast = phases.findIndex(p => p.id === currentPhase) > index;

            return (
              <div key={phase.id} className="flex items-center">
                <div
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : isPast
                      ? 'text-gray-500 bg-gray-50'
                      : 'text-gray-400'
                  }`}
                >
                  <span>{phase.icon}</span>
                  <span>{phase.label}</span>
                </div>
                {index < phases.length - 1 && (
                  <svg className="w-4 h-4 text-gray-300 mx-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
          {expiresAt && (
            <span className={`md:hidden ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${
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
    </div>
  );
}

