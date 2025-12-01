'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LobbyAgendaProps {
  hasJoined: boolean;
  playerCount: number;
  featureCount: number;
  isHost: boolean;
  onStartGame?: () => void;
}

interface AgendaStep {
  id: string;
  label: string;
  icon: string;
  isComplete: (props: LobbyAgendaProps) => boolean;
  description: string;
}

const AGENDA_STEPS: AgendaStep[] = [
  {
    id: 'join',
    label: 'Join the session',
    icon: '👋',
    isComplete: (props) => props.hasJoined,
    description: 'Enter your name and role',
  },
  {
    id: 'players',
    label: 'Wait for team members',
    icon: '👥',
    isComplete: (props) => props.playerCount >= 2,
    description: 'At least 2 players needed',
  },
  {
    id: 'features',
    label: 'Review features',
    icon: '📋',
    isComplete: (props) => props.featureCount > 0,
    description: 'Check what you\'ll vote on',
  },
  {
    id: 'start',
    label: 'Start voting',
    icon: '🚀',
    isComplete: () => false, // Never complete, it's the action
    description: 'Host starts the game',
  },
];

export function LobbyAgenda({
  hasJoined,
  playerCount,
  featureCount,
  isHost,
  onStartGame,
}: LobbyAgendaProps) {
  const [timeInLobby, setTimeInLobby] = useState(0);

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

  const props = { hasJoined, playerCount, featureCount, isHost, onStartGame };
  // Only count the first 3 steps (exclude "Start voting" which is an action, not a completion step)
  const preparationSteps = AGENDA_STEPS.slice(0, -1);
  const completedSteps = preparationSteps.filter((step) => step.isComplete(props)).length;
  const totalSteps = preparationSteps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Check if ready to start
  const canStart = AGENDA_STEPS.slice(0, -1).every((step) => step.isComplete(props));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 shadow-sm h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Session Agenda</h3>
          <p className="text-xs text-gray-600">Follow these steps to get started</p>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">{formatTime(timeInLobby)}</div>
          <div className="text-xs text-gray-500">Time in lobby</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-700">
            Progress: {completedSteps}/{totalSteps}
          </span>
          <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Steps Checklist */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {AGENDA_STEPS.map((step, index) => {
            const isComplete = step.isComplete(props);
            const isCurrentStep = !isComplete && AGENDA_STEPS.slice(0, index).every((s) => s.isComplete(props));
            const isLastStep = step.id === 'start';

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all duration-300 ${
                  isComplete
                    ? 'bg-green-50 border-green-200'
                    : isCurrentStep
                    ? 'bg-white border-blue-300 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                {/* Icon/Checkbox */}
                <div className="flex-shrink-0 mt-0.5">
                  {isComplete ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isCurrentStep ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                    >
                      {isCurrentStep && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-blue-500"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{step.icon}</span>
                    <p className={`text-sm font-medium ${isComplete ? 'text-green-800' : 'text-gray-900'}`}>
                      {step.label}
                    </p>
                  </div>
                  <p className={`text-xs mt-0.5 ${isComplete ? 'text-green-700' : 'text-gray-600'}`}>
                    {step.description}
                  </p>

                  {/* Special UI for last step */}
                  {isLastStep && canStart && isHost && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2.5"
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2.5">
                        <p className="text-xs text-blue-800">
                          <span className="font-semibold">Ready to begin?</span> This will move all players to the voting screen.
                        </p>
                      </div>
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0 0 rgba(59, 130, 246, 0.4)',
                            '0 0 0 8px rgba(59, 130, 246, 0)',
                          ],
                        }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="inline-block rounded-lg"
                      >
                        <button
                          onClick={onStartGame}
                          className="px-3 py-1.5 text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                          Begin Voting Round
                        </button>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Status Message */}
      {canStart && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 p-2.5 rounded-lg ${
            isHost
              ? 'bg-green-100 border border-green-300'
              : 'bg-blue-100 border border-blue-300'
          }`}
        >
          <p className={`text-xs font-medium ${isHost ? 'text-green-800' : 'text-blue-800'}`}>
            {isHost
              ? '✓ All set! You can start voting when ready.'
              : '✓ All set! Waiting for host to start voting...'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
