'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { StatementInput } from '@/components/problem-framing/StatementInput';
import { WaitingState } from '@/components/problem-framing/WaitingState';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { ArrowRight } from 'lucide-react';

export default function IndividualInputPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);
  const [submitting, setSubmitting] = useState(false);

  const participantId = typeof window !== 'undefined' ? localStorage.getItem('pf_participant_id') : null;
  const participantName = typeof window !== 'undefined' ? localStorage.getItem('pf_participant_name') : null;

  const currentParticipant = data?.participants.find(
    (p) => p.participant_id === participantId
  );

  const hasSubmitted = currentParticipant?.has_submitted || false;
  const participantsSubmitted = data?.participants.filter(p => p.has_submitted).length || 0;
  const totalParticipants = data?.participants.length || 0;
  const isFacilitator = currentParticipant?.is_facilitator || false;

  async function handleSubmit(statement: string) {
    if (!participantId || !participantName) {
      alert('Participant information not found. Please rejoin the session.');
      router.push(`/tools/problem-framing/${sessionId}/join`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/tools/problem-framing/${sessionId}/statements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          participantName,
          statement,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit statement');
      }

      // Statement submitted successfully
      // The waiting state will be shown automatically via the hook
    } catch (error) {
      console.error('Error submitting statement:', error);
      alert('Failed to submit statement. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdvanceToReview() {
    try {
      const response = await fetch(`/api/tools/problem-framing/${sessionId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextStep: 3 }),
      });

      if (!response.ok) {
        throw new Error('Failed to advance step');
      }

      router.push(`/tools/problem-framing/${sessionId}/review`);
    } catch (error) {
      console.error('Error advancing step:', error);
      alert('Failed to advance to next step. Please try again.');
    }
  }

  if (loading) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={2} totalSteps={5}>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </ToolLayout>
    );
  }

  if (!data) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={2} totalSteps={5}>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Session not found</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout toolSlug="problem-framing" currentStep={2} totalSteps={5}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Individual Input
          </h1>
          <p className="text-gray-600">
            Share your perspective on the problem. Your response will remain private until the review step.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          {!hasSubmitted ? (
            <StatementInput
              topicTitle={data.topic_title}
              topicDescription={data.topic_description || undefined}
              onSubmit={handleSubmit}
              loading={submitting}
            />
          ) : (
            <>
              <WaitingState
                participantsSubmitted={participantsSubmitted}
                totalParticipants={totalParticipants}
              />

              {/* Facilitator Controls */}
              {isFacilitator && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-900">
                      <strong>Facilitator:</strong> You can advance to the team review step when ready,
                      or wait for all participants to submit.
                    </p>
                  </div>
                  <Button
                    onClick={handleAdvanceToReview}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Proceed to Team Review
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Box */}
        {!hasSubmitted && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>Privacy Note:</strong> Your statement will not be visible to other participants
              until the facilitator advances to the team review step. This prevents anchoring bias.
            </p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
