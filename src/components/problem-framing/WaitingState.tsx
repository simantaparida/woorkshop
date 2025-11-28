'use client';

import { Clock, Users } from 'lucide-react';

interface WaitingStateProps {
  participantsSubmitted: number;
  totalParticipants: number;
}

export function WaitingState({ participantsSubmitted, totalParticipants }: WaitingStateProps) {
  const percentage = totalParticipants > 0
    ? Math.round((participantsSubmitted / totalParticipants) * 100)
    : 0;

  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
        <Clock className="w-10 h-10 text-blue-600" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Waiting for others...
      </h3>

      <p className="text-gray-600 mb-6">
        Your statement has been submitted successfully
      </p>

      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {participantsSubmitted} of {totalParticipants} participants have submitted
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <p className="text-sm text-gray-500 mt-4">
          The facilitator will advance to the next step once everyone is ready
        </p>
      </div>
    </div>
  );
}
