'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WorkshopPhase } from '@/types';

interface Prompt {
  id: string;
  question: string;
  context: string;
}

const PROMPTS_BY_PHASE: Record<WorkshopPhase, Prompt[]> = {
  introduction: [
    {
      id: 'intro-1',
      question: 'What are the key business goals for this prioritization session?',
      context: 'Set clear objectives and success criteria'
    },
    {
      id: 'intro-2',
      question: 'What constraints should we consider (budget, timeline, resources)?',
      context: 'Establish realistic boundaries'
    },
    {
      id: 'intro-3',
      question: 'Who are the primary users/customers for these features?',
      context: 'Focus on user impact'
    }
  ],
  discussion: [
    {
      id: 'disc-1',
      question: 'What user problem does this feature solve?',
      context: 'Validate problem-solution fit'
    },
    {
      id: 'disc-2',
      question: 'What\'s the technical complexity and risk level?',
      context: 'Assess implementation difficulty'
    },
    {
      id: 'disc-3',
      question: 'How does this align with our strategic goals?',
      context: 'Ensure strategic alignment'
    },
    {
      id: 'disc-4',
      question: 'What data or research supports this feature?',
      context: 'Ground decisions in evidence'
    },
    {
      id: 'disc-5',
      question: 'What dependencies or blockers exist?',
      context: 'Identify prerequisites'
    },
    {
      id: 'disc-6',
      question: 'What\'s the expected user impact and reach?',
      context: 'Quantify potential value'
    },
    {
      id: 'disc-7',
      question: 'Are there alternative solutions with better trade-offs?',
      context: 'Explore options'
    }
  ],
  voting: [
    {
      id: 'vote-1',
      question: 'Consider: What delivers maximum value with minimal effort?',
      context: 'Look for quick wins'
    },
    {
      id: 'vote-2',
      question: 'Consider: What aligns with our strategic priorities?',
      context: 'Think long-term'
    },
    {
      id: 'vote-3',
      question: 'Consider: What has the strongest user/business case?',
      context: 'Prioritize impact'
    }
  ],
  results: [
    {
      id: 'res-1',
      question: 'Do the results align with our strategic priorities?',
      context: 'Validate prioritization'
    },
    {
      id: 'res-2',
      question: 'Are there any surprising results worth discussing?',
      context: 'Surface disagreements'
    },
    {
      id: 'res-3',
      question: 'What are the next steps for implementation?',
      context: 'Move from decision to action'
    }
  ]
};

interface DiscussionPromptsProps {
  phase: WorkshopPhase;
  isExpanded?: boolean;
}

export function DiscussionPrompts({ phase, isExpanded = false }: DiscussionPromptsProps) {
  const [expandedPromptId, setExpandedPromptId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(!isExpanded);

  const prompts = PROMPTS_BY_PHASE[phase] || [];

  if (prompts.length === 0) return null;

  const getPhaseEmoji = (phase: WorkshopPhase): string => {
    const emojiMap = {
      introduction: '👋',
      discussion: '💬',
      voting: '🗳️',
      results: '📊'
    };
    return emojiMap[phase];
  };

  const getPhaseTitle = (phase: WorkshopPhase): string => {
    const titleMap = {
      introduction: 'Introduction',
      discussion: 'Discussion',
      voting: 'Voting',
      results: 'Results'
    };
    return titleMap[phase];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-indigo-100/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getPhaseEmoji(phase)}</span>
          <div className="text-left">
            <h3 className="text-sm font-bold text-indigo-900">
              Discussion Prompts
            </h3>
            <p className="text-xs text-indigo-700">
              {getPhaseTitle(phase)} Phase • {prompts.length} questions
            </p>
          </div>
        </div>
        <motion.svg
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          className="w-5 h-5 text-indigo-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>

      {/* Prompts List */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="px-5 pb-4"
          >
            <div className="space-y-2">
              {prompts.map((prompt, index) => (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-lg border border-indigo-200 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedPromptId(expandedPromptId === prompt.id ? null : prompt.id)}
                    className="w-full px-4 py-3 flex items-start gap-3 text-left hover:bg-indigo-50 transition-colors"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {prompt.question}
                      </p>
                      {expandedPromptId === prompt.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-gray-600 mt-2 italic"
                        >
                          💡 {prompt.context}
                        </motion.p>
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-indigo-400 flex-shrink-0 transition-transform ${
                        expandedPromptId === prompt.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Facilitator Tips */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-xs font-semibold text-amber-900 mb-1">Facilitator Tip</p>
                  <p className="text-xs text-amber-800">
                    {phase === 'discussion' && 'Encourage diverse perspectives. Give everyone a chance to speak.'}
                    {phase === 'voting' && 'Remind participants to consider both impact and feasibility.'}
                    {phase === 'introduction' && 'Set the stage and ensure everyone understands the process.'}
                    {phase === 'results' && 'Discuss surprising results and build consensus on next steps.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
