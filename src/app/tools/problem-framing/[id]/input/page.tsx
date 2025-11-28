'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { StatementInput } from '@/components/problem-framing/StatementInput';
import { ShareLink } from '@/components/problem-framing/ShareLink';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { ArrowRight, Users, CheckCircle2, Clock } from 'lucide-react';

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

  const isFacilitator = currentParticipant?.is_facilitator || false;
  const hasSubmitted = currentParticipant?.has_submitted || false;

  // Calculate participant stats (excluding facilitator)
  const regularParticipants = data?.participants.filter(p => !p.is_facilitator) || [];
  const submittedCount = regularParticipants.filter(p => p.has_submitted).length;
  const totalRegularParticipants = regularParticipants.length;

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

  function handleStepClick(step: number) {
    const routes = [
      `/tools/problem-framing/${sessionId}/join`,
      `/tools/problem-framing/${sessionId}/input`,
      `/tools/problem-framing/${sessionId}/review`,
      `/tools/problem-framing/${sessionId}/finalize`,
      `/tools/problem-framing/${sessionId}/summary`,
    ];

    if (step >= 1 && step <= routes.length) {
      router.push(routes[step - 1]);
    }
  }

  if (loading) {
    return (
      <ToolLayout
        toolSlug="problem-framing"
        currentStep={2}
        totalSteps={5}
        onStepClick={handleStepClick}
        canNavigate={isFacilitator}
      >
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </ToolLayout>
    );
  }

  if (!data) {
    return (
      <ToolLayout
        toolSlug="problem-framing"
        currentStep={2}
        totalSteps={5}
        onStepClick={handleStepClick}
        canNavigate={isFacilitator}
      >
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Session not found</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout
      toolSlug="problem-framing"
      currentStep={2}
      totalSteps={5}
      onStepClick={handleStepClick}
      canNavigate={isFacilitator}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* FACILITATOR VIEW */}
        {isFacilitator ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Individual Input - Facilitator View
              </h1>
              <p className="text-gray-600">
                Monitor participant submissions and advance when ready. You can optionally submit your own input below.
              </p>
            </div>

            {/* Facilitator's Own Input (Optional) */}
            {!hasSubmitted && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Your Input (Optional)
                  </h2>
                  <p className="text-sm text-gray-600">
                    As facilitator, you can optionally add your own perspective.
                  </p>
                </div>
                <StatementInput
                  topicTitle={data.topic_title}
                  topicDescription={data.topic_description || undefined}
                  onSubmit={handleSubmit}
                  loading={submitting}
                />
              </div>
            )}

            {hasSubmitted && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-3 text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">You've submitted your input</p>
                    <p className="text-sm text-gray-600">Your perspective has been added to the session</p>
                  </div>
                </div>
              </div>
            )}

            {/* Participant Status Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Participant Submissions
                    </h2>
                    <p className="text-sm text-gray-600">
                      {submittedCount} of {totalRegularParticipants} participants have submitted
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {totalRegularParticipants > 0 ? Math.round((submittedCount / totalRegularParticipants) * 100) : 0}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${totalRegularParticipants > 0 ? (submittedCount / totalRegularParticipants) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Participant List */}
              <div className="space-y-2">
                {regularParticipants.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <p>No participants have joined yet.</p>
                    <p className="text-sm mt-2">Share the session link to invite participants.</p>
                  </div>
                ) : (
                  regularParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900 font-medium">
                        {participant.participant_name}
                      </span>
                      {participant.has_submitted ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Submitted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-amber-600">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Waiting</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Facilitator Actions */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <strong>Facilitator:</strong> You can advance to team review when you're ready.
                    {submittedCount < totalRegularParticipants && (
                      <> Waiting for {totalRegularParticipants - submittedCount} more {totalRegularParticipants - submittedCount === 1 ? 'participant' : 'participants'}.</>
                    )}
                  </p>
                </div>
                <Button
                  onClick={handleAdvanceToReview}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={submittedCount === 0}
                >
                  Proceed to Team Review ({data.individual_statements?.length || 0} statements)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {submittedCount === 0 && (
                  <p className="text-sm text-center text-gray-500 mt-2">
                    At least one participant must submit before advancing
                  </p>
                )}
              </div>
            </div>

            <ShareLink sessionId={sessionId} />
          </>
        ) : (
          /* PARTICIPANT VIEW */
          <>
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
                <>
                  <StatementInput
                    topicTitle={data.topic_title}
                    topicDescription={data.topic_description || undefined}
                    onSubmit={handleSubmit}
                    loading={submitting}
                  />
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                      <strong>Privacy Note:</strong> Your statement will not be visible to other participants
                      until the facilitator advances to the team review step. This prevents anchoring bias.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Statement Submitted!
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Thank you for your input. Waiting for the facilitator to start the team review.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      <Clock className="w-4 h-4" />
                      <span>
                        {submittedCount} of {totalRegularParticipants} participants have submitted
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
