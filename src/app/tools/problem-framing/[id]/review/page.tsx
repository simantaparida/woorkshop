'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { StatementCard } from '@/components/problem-framing/StatementCard';
import { ShareLink } from '@/components/problem-framing/ShareLink';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { ArrowRight, Eye, AlertCircle } from 'lucide-react';

export default function TeamReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);

  const participantId = typeof window !== 'undefined' ? localStorage.getItem('pf_participant_id') : null;
  const participantName = typeof window !== 'undefined' ? localStorage.getItem('pf_participant_name') : null;

  const currentParticipant = data?.participants.find(
    (p) => p.participant_id === participantId
  );

  const isCreator = data?.session?.created_by === participantId;
  const isFacilitator = currentParticipant?.is_facilitator || isCreator || false;

  // Auto-navigate participants when facilitator advances session
  useEffect(() => {
    if (!data || isFacilitator) return;

    const statusToRoute: Record<string, string> = {
      'finalize': `/tools/problem-framing/${sessionId}/finalize`,
      'summary': `/tools/problem-framing/${sessionId}/summary`,
      'completed': `/tools/problem-framing/${sessionId}/summary`,
    };

    const nextRoute = statusToRoute[data.session.status];
    if (nextRoute) {
      router.push(nextRoute);
    }
  }, [data?.session.status, isFacilitator, router, sessionId]);

  async function handleTogglePin(statementId: string) {
    if (!participantId || !participantName) return;

    try {
      const response = await fetch(`/api/tools/problem-framing/${sessionId}/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statementId,
          participantId,
          participantName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle pin');
      }

      // Pin toggled successfully - hook will update UI
    } catch (error) {
      console.error('Error toggling pin:', error);
      alert('Failed to toggle pin. Please try again.');
    }
  }

  async function handleAdvanceToFinalize() {
    try {
      const facilitatorId = localStorage.getItem('pf_participant_id');

      if (!facilitatorId) {
        alert('Facilitator ID not found. Please refresh and try again.');
        return;
      }

      const response = await fetch(`/api/tools/problem-framing/${sessionId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep: 4, facilitatorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to advance step');
      }

      router.push(`/tools/problem-framing/${sessionId}/finalize`);
    } catch (error) {
      console.error('Error advancing step:', error);
      const message = error instanceof Error ? error.message : 'Please try again.';
      alert(`Failed to advance to next step: ${message}`);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600">The session you are looking for does not exist or has ended.</p>
        </div>
      </AppLayout>
    );
  }

  const statements = data.individual_statements || [];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Timeline */}
        <SessionTimeline currentStep={3} />

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Team Review
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review all problem statements submitted by the team. Read through different perspectives and pin the ones that resonate most.
          </p>
        </div>

        {/* Topic Display */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600 mt-1">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{data.topic_title}</h2>
              {data.topic_description && (
                <p className="text-gray-600">{data.topic_description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Statements Grid */}
        {statements.length > 0 ? (
          <div className="space-y-6 mb-12">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Individual Perspectives ({statements.length})
              </h3>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                Click the star to pin important insights
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {statements.map((statement) => (
                <StatementCard
                  key={statement.id}
                  statement={statement}
                  currentParticipantId={participantId || ''}
                  onPin={handleTogglePin}
                  showPin={true}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-12 text-center mb-8">
            <p className="text-gray-500 font-medium">No statements submitted yet</p>
          </div>
        )}

        {/* Facilitator Controls */}
        {isFacilitator ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 p-8 sticky bottom-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Facilitator Actions</h3>
                  <p className="text-sm text-gray-600">
                    Once the team has reviewed all perspectives, proceed to create the final agreed problem statement.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAdvanceToFinalize}
                variant="primary"
                size="lg"
                className="w-full md:w-auto px-8 py-4 text-lg font-bold shadow-lg shadow-blue-200/50"
              >
                Create Final Statement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          /* Info Box for Participants */
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
            <p className="text-blue-800 font-medium">
              Waiting for facilitator to advance to the final consensus step...
            </p>
          </div>
        )}

        {/* Share Link - Show for facilitators */}
        {isFacilitator && (
          <div className="mt-12 flex justify-center">
            <ShareLink sessionId={sessionId} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
