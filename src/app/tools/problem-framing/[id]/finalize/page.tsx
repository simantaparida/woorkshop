'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { FinalStatementEditor } from '@/components/problem-framing/FinalStatementEditor';
import { StatementCard } from '@/components/problem-framing/StatementCard';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { AlertCircle } from 'lucide-react';

export default function FinalizePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);
  const [finalizing, setFinalizing] = useState(false);

  const participantId = typeof window !== 'undefined' ? localStorage.getItem('pf_participant_id') : null;
  const participantName = typeof window !== 'undefined' ? localStorage.getItem('pf_participant_name') : null;

  const currentParticipant = data?.participants.find(
    (p) => p.participant_id === participantId
  );

  const isFacilitator = currentParticipant?.is_facilitator || false;

  // Redirect non-facilitators
  useEffect(() => {
    if (!loading && data && !isFacilitator) {
      alert('Only the facilitator can create the final statement.');
      router.push(`/tools/problem-framing/${sessionId}/review`);
    }
  }, [loading, data, isFacilitator, router, sessionId]);

  async function handleFinalize(statement: string) {
    if (!participantId || !participantName) {
      alert('Participant information not found. Please rejoin the session.');
      router.push(`/tools/problem-framing/${sessionId}/join`);
      return;
    }

    setFinalizing(true);

    try {
      const response = await fetch(`/api/tools/problem-framing/${sessionId}/finalize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statement,
          participantId,
          participantName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to finalize statement');
      }

      // Navigate to summary
      router.push(`/tools/problem-framing/${sessionId}/summary`);
    } catch (error) {
      console.error('Error finalizing statement:', error);
      alert('Failed to finalize statement. Please try again.');
    } finally {
      setFinalizing(false);
    }
  }

  if (loading) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={4} totalSteps={5}>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </ToolLayout>
    );
  }

  if (!data) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={4} totalSteps={5}>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Session not found</p>
        </div>
      </ToolLayout>
    );
  }

  if (!isFacilitator) {
    return null; // Will redirect via useEffect
  }

  const statements = data.individual_statements || [];
  // Pre-fill with facilitator's own statement if available
  const facilitatorStatement = statements.find(s => s.participant_id === participantId);
  const initialValue = facilitatorStatement?.statement || '';

  return (
    <ToolLayout toolSlug="problem-framing" currentStep={4} totalSteps={5}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create Final Statement
          </h1>
          <p className="text-gray-600">
            Based on all individual perspectives, craft a final statement that captures
            the team's shared understanding of the problem.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Reference Statements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Individual Perspectives ({statements.length})
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {statements.map((statement) => (
                <StatementCard
                  key={statement.id}
                  statement={statement}
                  currentParticipantId={participantId || ''}
                  onPin={() => {}} // No pin functionality on this page
                  showPin={false}
                />
              ))}
            </div>
          </div>

          {/* Right: Final Statement Editor */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <FinalStatementEditor
              initialValue={initialValue}
              onFinalize={handleFinalize}
              loading={finalizing}
            />

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Tips for creating the final statement:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Synthesize common themes from individual perspectives</li>
                    <li>Be specific and actionable</li>
                    <li>Focus on the problem, not the solution</li>
                    <li>Ensure it resonates with the whole team</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
