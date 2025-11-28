'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { JoinForm } from '@/components/problem-framing/JoinForm';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { Users, ArrowRight } from 'lucide-react';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);
  const [hasJoined, setHasJoined] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);

  useEffect(() => {
    // Check if user has already joined
    const participantId = localStorage.getItem('pf_participant_id');
    if (participantId && data?.participants) {
      const isParticipant = data.participants.some((p) => p.participant_id === participantId);
      setHasJoined(isParticipant);
    }
  }, [data?.participants]);

  async function handleJoin(name: string) {
    setJoiningLoading(true);

    try {
      const participantId = crypto.randomUUID();

      const response = await fetch(`/api/tools/problem-framing/${sessionId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId, participantName: name }),
      });

      if (!response.ok) {
        throw new Error('Failed to join session');
      }

      // Store participant info
      localStorage.setItem('pf_participant_id', participantId);
      localStorage.setItem('pf_participant_name', name);

      setHasJoined(true);
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session. Please try again.');
    } finally {
      setJoiningLoading(false);
    }
  }

  function handleStart() {
    router.push(`/tools/problem-framing/${sessionId}/input`);
  }

  const currentParticipant = data?.participants.find(
    (p) => p.participant_id === localStorage.getItem('pf_participant_id')
  );
  const isFacilitator = currentParticipant?.is_facilitator || false;

  if (loading) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={1} totalSteps={5}>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout toolSlug="problem-framing" currentStep={1} totalSteps={5}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{data?.topic_title}</h1>
          {data?.topic_description && (
            <p className="text-gray-700">{data.topic_description}</p>
          )}
        </div>

        {/* Join Form or Participants List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {!hasJoined ? (
            <JoinForm onJoin={handleJoin} loading={joiningLoading} />
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  You've joined the session!
                </h2>
                <p className="text-gray-600">
                  Waiting for the facilitator to start the session
                </p>
              </div>

              {/* Participants List */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Participants ({data?.participants.length})
                </h3>
                <div className="space-y-2">
                  {data?.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900 font-medium">
                        {participant.participant_name}
                      </span>
                      {participant.is_facilitator && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Facilitator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilitator Controls */}
              {isFacilitator && (
                <div className="border-t border-gray-200 pt-6">
                  <Button
                    onClick={handleStart}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Start Individual Inputs
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Link */}
        {hasJoined && (
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2 font-medium">Share this link with participants:</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== 'undefined' ? window.location.href : ''}
                className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
              >
                Copy
              </Button>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
