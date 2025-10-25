'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '@/types';

interface PlayerListProps {
  players: Player[];
  votedPlayerIds?: Set<string>;
  showVoteStatus?: boolean;
}

export function PlayerList({
  players,
  votedPlayerIds = new Set(),
  showVoteStatus = false,
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
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {player.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Name */}
              <div>
                <p className="font-medium text-gray-900">
                  {player.name}
                  {player.is_host && (
                    <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium group relative">
                      Host
                      {/* Tooltip */}
                      <span className="invisible group-hover:visible absolute left-0 top-full mt-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 z-10 shadow-lg">
                        Can start the game when ready
                        <span className="absolute bottom-full left-4 border-4 border-transparent border-b-gray-900"></span>
                      </span>
                    </span>
                  )}
                </p>
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
