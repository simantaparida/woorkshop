'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { JoinForm } from '@/components/problem-framing/JoinForm';
import { ShareLink } from '@/components/problem-framing/ShareLink';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { Users, ArrowRight, FileText } from 'lucide-react';

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

      // Auto-advance regular participants to current step
      if (isParticipant) {
        const currentParticipant = data.participants.find((p) => p.participant_id === participantId);
        const isFacilitator = currentParticipant?.is_facilitator || false;

        // If not facilitator and session status has advanced, redirect them
        if (!isFacilitator && data.session.status !== 'setup') {
          const statusToRoute: Record<string, string> = {
            'input': `/tools/problem-framing/${sessionId}/input`,
            'review': `/tools/problem-framing/${sessionId}/review`,
            'finalize': `/tools/problem-framing/${sessionId}/finalize`,
            'summary': `/tools/problem-framing/${sessionId}/summary`,
            'completed': `/tools/problem-framing/${sessionId}/summary`,
          };

          const nextRoute = statusToRoute[data.session.status];
          if (nextRoute) {
            router.push(nextRoute);
          }
        }
      }
    }
  }, [data?.participants, data?.session, router, sessionId]);

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

  async function handleStart() {
    try {
      // Update session status to 'input' so participants can submit
      const response = await fetch(`/api/tools/problem-framing/${sessionId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep: 2 }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      router.push(`/tools/problem-framing/${sessionId}/input`);
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
    }
  }

  const currentParticipant = data?.participants.find(
    (p) => p.participant_id === localStorage.getItem('pf_participant_id')
  );
  const isFacilitator = currentParticipant?.is_facilitator || false;

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 transform rotate-3">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {data?.topic_title || 'Problem Framing Session'}
          </h1>
          {data?.topic_description && (
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              {data.topic_description}
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 p-8">
          {!hasJoined ? (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Join the Session</h2>
                <p className="text-gray-500">Enter your name to join the team</p>
              </div>
              <JoinForm onJoin={handleJoin} loading={joiningLoading} />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  You're in!
                </h2>
                <p className="text-gray-600">
                  Waiting for the facilitator to start the session...
                </p>
              </div>

              {/* Participants List */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  Participants ({data?.participants.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {data?.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-lg shadow-sm"
                    >
                      <span className="text-gray-900 font-medium">
                        {participant.participant_name}
                      </span>
                      {participant.is_facilitator && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                          Facilitator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Facilitator Controls */}
              {isFacilitator && (
                <div className="pt-4">
                  <Button
                    onClick={handleStart}
                    variant="primary"
                    size="lg"
                    className="w-full py-4 text-lg font-semibold shadow-lg shadow-blue-200/50"
                  >
                    Start Session
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Share Link */}
        {hasJoined && (
          <div className="mt-8 flex justify-center">
            <ShareLink sessionId={sessionId} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
