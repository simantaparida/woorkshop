'use client';

import { Star } from 'lucide-react';
import type { PFIndividualStatement } from '@/types';

interface StatementCardProps {
  statement: PFIndividualStatement;
  currentParticipantId: string;
  onPin: (statementId: string) => void;
  showPin?: boolean;
}

export function StatementCard({
  statement,
  currentParticipantId,
  onPin,
  showPin = true,
}: StatementCardProps) {
  const isPinned = statement.pins?.some(
    (p) => p.pinned_by_participant_id === currentParticipantId
  ) || false;

  const handlePinClick = () => {
    onPin(statement.id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 text-lg">
            {statement.participant_name}
          </h4>
          <span className="text-sm text-gray-500">
            {new Date(statement.submitted_at).toLocaleString()}
          </span>
        </div>

        {showPin && (
          <button
            onClick={handlePinClick}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
              isPinned
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isPinned ? 'Unpin statement' : 'Pin statement'}
          >
            <Star
              className={`w-4 h-4 ${isPinned ? 'fill-yellow-400 stroke-yellow-600' : ''}`}
            />
            {statement.pin_count !== undefined && statement.pin_count > 0 && (
              <span className="text-sm font-medium">{statement.pin_count}</span>
            )}
          </button>
        )}
      </div>

      <p className="text-gray-900 text-base leading-relaxed whitespace-pre-wrap">
        {statement.statement}
      </p>
    </div>
  );
}
