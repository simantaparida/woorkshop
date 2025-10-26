'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/types';
import { getRoleById } from '@/lib/constants/player-roles';

interface PlayerListProps {
  players: Player[];
  votedPlayerIds?: Set<string>;
  showVoteStatus?: boolean;
  showReadyStatus?: boolean;
}

export function PlayerList({
  players,
  votedPlayerIds = new Set(),
  showVoteStatus = false,
  showReadyStatus = false,
}: PlayerListProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Players ({players.length})
      </h3>
      <AnimatePresence mode="popLayout">
        {players.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              {/* Avatar with Ready Status Ring */}
              <div className="relative">
                <div className={`w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center ${
                  showReadyStatus ? (player.is_ready ? 'ring-2 ring-green-500 ring-offset-2' : 'ring-2 ring-gray-300 ring-offset-2') : ''
                }`}>
                  <span className="text-primary-700 font-semibold text-sm">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {showReadyStatus && player.is_ready && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </div>

              {/* Name */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900">
                    {player.name}
                  </p>
                  {player.is_host && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium border border-primary-200">
                      Host
                    </span>
                  )}
                  {player.role && getRoleById(player.role) && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${getRoleById(player.role)?.badgeClasses}`}>
                      <span>{getRoleById(player.role)?.icon}</span>
                      <span>{getRoleById(player.role)?.shortLabel}</span>
                    </span>
                  )}
                  {showReadyStatus && (
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${
                      player.is_ready
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {player.is_ready ? '✓ Ready' : '○ Not Ready'}
                    </span>
                  )}
                </div>
                {player.is_host && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Can start the game
                  </p>
                )}
              </div>
            </div>

            {/* Vote Status */}
            {showVoteStatus && (
              <div>
                {votedPlayerIds.has(player.id) ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Voted</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg
                      className="w-5 h-5 animate-pulse"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Voting...</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {players.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No players yet</p>
        </div>
      )}
    </div>
  );
}
