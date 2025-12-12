'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import type { PFIndividualStatement } from '@/types';

interface StatementCardProps {
  statement: PFIndividualStatement;
  currentParticipantId: string;
  onPin: (statementId: string) => Promise<void>;
  showPin?: boolean;
}

export function StatementCard({
  statement,
  currentParticipantId,
  onPin,
  showPin = true,
}: StatementCardProps) {
  const actualIsPinned = statement.pins?.some(
    (p) => p.pinned_by_participant_id === currentParticipantId
  ) || false;

  // Optimistic state
  const [optimisticPinned, setOptimisticPinned] = useState(actualIsPinned);
  const [isToggling, setIsToggling] = useState(false);

  // Use optimistic state if toggling, otherwise use actual state
  const isPinned = isToggling ? optimisticPinned : actualIsPinned;

  const handlePinClick = async () => {
    // Optimistic update
    setOptimisticPinned(!optimisticPinned);
    setIsToggling(true);

    try {
      await onPin(statement.id);
      // Success - optimistic state will be replaced by real data on next fetch
    } catch (error) {
      // Rollback on error
      setOptimisticPinned(actualIsPinned);
      toast.error('Failed to pin statement', {
        description: 'Please try again.',
      });
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className={`bg-white rounded-xl p-4 transition-all border ${
      isPinned
        ? 'border-yellow-400 ring-2 ring-yellow-100'
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-sm truncate mb-0.5">
            {statement.participant_name}
          </h4>
          <span className="text-xs text-gray-500">
            {new Date(statement.submitted_at).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        {showPin && (
          <button
            onClick={handlePinClick}
            disabled={isToggling}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all flex-shrink-0 ml-2 ${
              isPinned
                ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-300'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300'
            } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isPinned ? 'Unpin statement' : 'Pin statement'}
          >
            <Star
              className={`w-3.5 h-3.5 ${isPinned ? 'fill-yellow-400 stroke-yellow-600' : ''}`}
            />
            {statement.pin_count !== undefined && statement.pin_count > 0 && (
              <span className="text-xs font-bold">{statement.pin_count}</span>
            )}
          </button>
        )}
      </div>

      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
        {statement.statement}
      </p>
    </div>
  );
}
