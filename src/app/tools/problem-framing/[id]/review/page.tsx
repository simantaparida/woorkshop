'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { StatementCard } from '@/components/problem-framing/StatementCard';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { ArrowRight, Eye } from 'lucide-react';

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

  const isFacilitator = currentParticipant?.is_facilitator || false;

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
      const response = await fetch(`/api/tools/problem-framing/${sessionId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep: 4 }),
      });

      if (!response.ok) {
        throw new Error('Failed to advance step');
      }

      router.push(`/tools/problem-framing/${sessionId}/finalize`);
    } catch (error) {
      console.error('Error advancing step:', error);
      alert('Failed to advance to next step. Please try again.');
    }
  }

  if (loading) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={3} totalSteps={5}>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </ToolLayout>
    );
  }

  if (!data) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={3} totalSteps={5}>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Session not found</p>
        </div>
      </ToolLayout>
    );
  }

  const statements = data.individual_statements || [];

  return (
    <ToolLayout toolSlug="problem-framing" currentStep={3} totalSteps={5}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Team Review
          </h1>
          <p className="text-gray-600">
            Review all problem statements submitted by the team. You can pin important insights.
          </p>
        </div>

        {/* Topic Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Eye className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{data.topic_title}</h2>
              {data.topic_description && (
                <p className="text-gray-700">{data.topic_description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Statements Grid */}
        {statements.length > 0 ? (
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Individual Perspectives ({statements.length})
              </h3>
              <p className="text-sm text-gray-500">
                Click the star to pin important statements
              </p>
            </div>

            <div className="grid gap-4">
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
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center mb-8">
            <p className="text-gray-600">No statements submitted yet</p>
          </div>
        )}

        {/* Facilitator Controls */}
        {isFacilitator && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>Facilitator:</strong> Once the team has reviewed all perspectives,
                proceed to create the final agreed problem statement.
              </p>
            </div>
            <Button
              onClick={handleAdvanceToFinalize}
              variant="primary"
              size="lg"
              className="w-full"
            >
              Create Final Statement
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Info Box */}
        {!isFacilitator && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600">
              Waiting for facilitator to advance to the next step
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
