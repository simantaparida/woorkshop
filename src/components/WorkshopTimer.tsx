'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkshopTimerProps {
  phaseStartedAt: string | null;
  timeAllocatedMinutes: number | null;
  isPaused?: boolean;
  onTimeUp?: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getTimerColor(percentRemaining: number): string {
  if (percentRemaining > 50) return 'text-green-600';
  if (percentRemaining > 25) return 'text-yellow-600';
  if (percentRemaining > 10) return 'text-orange-600';
  return 'text-red-600';
}

function getProgressColor(percentRemaining: number): string {
  if (percentRemaining > 50) return 'bg-green-500';
  if (percentRemaining > 25) return 'bg-yellow-500';
  if (percentRemaining > 10) return 'bg-orange-500';
  return 'bg-red-500';
}

export function WorkshopTimer({
  phaseStartedAt,
  timeAllocatedMinutes,
  isPaused = false,
  onTimeUp
}: WorkshopTimerProps) {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [hasNotifiedTimeUp, setHasNotifiedTimeUp] = useState(false);

  useEffect(() => {
    if (!phaseStartedAt || !timeAllocatedMinutes) {
      setSecondsRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const startTime = new Date(phaseStartedAt).getTime();
      const now = Date.now();
      const elapsedMs = now - startTime;
      const totalMs = timeAllocatedMinutes * 60 * 1000;
      const remainingMs = totalMs - elapsedMs;
      return Math.max(0, Math.floor(remainingMs / 1000));
    };

    setSecondsRemaining(calculateRemaining());
    setHasNotifiedTimeUp(false);

    if (isPaused) return;

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsRemaining(remaining);

      if (remaining === 0 && !hasNotifiedTimeUp) {
        setHasNotifiedTimeUp(true);
        onTimeUp?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [phaseStartedAt, timeAllocatedMinutes, isPaused, onTimeUp, hasNotifiedTimeUp]);

  if (secondsRemaining === null) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">No timer set</span>
        </div>
      </div>
    );
  }

  const totalSeconds = timeAllocatedMinutes! * 60;
  const percentRemaining = (secondsRemaining / totalSeconds) * 100;
  const isTimeUp = secondsRemaining === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`border-2 rounded-xl p-5 ${
        isTimeUp
          ? 'bg-red-50 border-red-500'
          : 'bg-white border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            {isPaused ? 'Timer Paused' : 'Time Remaining'}
          </span>
        </div>
        {isPaused && (
          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-medium">
            ⏸ Paused
          </span>
        )}
      </div>

      {/* Timer Display */}
      <div className="text-center mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={secondsRemaining}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-5xl font-bold tabular-nums ${getTimerColor(percentRemaining)}`}
          >
            {formatTime(secondsRemaining)}
          </motion.div>
        </AnimatePresence>

        {isTimeUp && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-semibold text-red-600 mt-2"
          >
            ⏰ Time's up!
          </motion.p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: `${percentRemaining}%` }}
          transition={{ duration: 0.5 }}
          className={`h-full ${getProgressColor(percentRemaining)} rounded-full`}
        />
      </div>

      {/* Time Stats */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
        <span>
          Elapsed: {formatTime(totalSeconds - secondsRemaining)}
        </span>
        <span>
          Total: {formatTime(totalSeconds)}
        </span>
      </div>
    </motion.div>
  );
}
