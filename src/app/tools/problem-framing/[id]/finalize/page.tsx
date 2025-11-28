'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { FinalStatementEditor } from '@/components/problem-framing/FinalStatementEditor';
import { StatementCard } from '@/components/problem-framing/StatementCard';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { AlertCircle, CheckCircle2, FileText } from 'lucide-react';

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
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600">The session you are looking for does not exist or has ended.</p>
        </div>
      </AppLayout>
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
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Timeline */}
        <SessionTimeline currentStep={4} />

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Final Consensus
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Based on all individual perspectives, craft a final statement that captures the team's shared understanding of the problem.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Left: Reference Statements */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Individual Perspectives ({statements.length})
              </h3>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 max-h-[800px] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {statements.map((statement) => (
                  <StatementCard
                    key={statement.id}
                    statement={statement}
                    currentParticipantId={participantId || ''}
                    onPin={() => { }} // No pin functionality on this page
                    showPin={false}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Final Statement Editor */}
          <div className="lg:sticky lg:top-8 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 p-8">
              <div className="mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Final Problem Statement</h2>
                <p className="text-gray-600 text-sm mt-1">
                  This will be the official output of this session.
                </p>
              </div>

              <FinalStatementEditor
                initialValue={initialValue}
                onFinalize={handleFinalize}
                loading={finalizing}
              />
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-blue-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-sm text-blue-900">
                  <p className="font-bold text-base mb-2">Tips for a great problem statement:</p>
                  <ul className="space-y-2">
                    <li className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      Synthesize common themes from individual perspectives
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      Be specific and actionable
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      Focus on the problem, not the solution
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-500">•</span>
                      Ensure it resonates with the whole team
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
