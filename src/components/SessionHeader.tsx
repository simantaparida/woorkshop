'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from './ui/Button';
import { ROUTES } from '@/lib/constants';

interface SessionHeaderProps {
  sessionId?: string;
  sessionName?: string;
  playerName?: string;
  isHost?: boolean;
  showBackButton?: boolean;
}

export function SessionHeader({
  sessionId,
  sessionName,
  playerName,
  isHost = false,
  showBackButton = true,
}: SessionHeaderProps) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Session Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(ROUTES.HOME)}
              className="text-2xl font-bold text-primary hover:text-primary-700 transition-colors"
            >
              UX Works
            </button>

            {sessionName && (
              <>
                <div className="hidden sm:block w-px h-6 bg-gray-300" />
                <div className="hidden sm:block text-gray-700">
                  <p className="text-sm font-medium">{sessionName}</p>
                </div>
              </>
            )}
          </div>

          {/* Right: User Info + Actions */}
          <div className="flex items-center gap-3">
            {playerName && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-sm">
                    {playerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {playerName}
                    {isHost && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        Host
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="hidden sm:flex"
              >
                ← Back
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(ROUTES.HOME)}
            >
              🏠 Home
            </Button>
          </div>
        </div>

        {/* Mobile Session Name */}
        {sessionName && (
          <div className="sm:hidden mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700">{sessionName}</p>
          </div>
        )}
      </div>
    </motion.header>
  );
}
