'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { FinalStatementEditor } from '@/components/problem-framing/FinalStatementEditor';
import { StatementCard } from '@/components/problem-framing/StatementCard';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { supabase } from '@/lib/supabase/client';
import { AlertCircle, FileText, X } from 'lucide-react';

export default function FinalizePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);
  const [finalizing, setFinalizing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const hasRedirected = useRef(false);

  // Sync localStorage with authenticated user ID on mount
  useEffect(() => {
    setIsClient(true);

    const syncParticipantId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.id) {
          const storedId = localStorage.getItem('pf_participant_id');

          // If stored ID differs from user ID, update it
          if (storedId !== user.id) {
            localStorage.setItem('pf_participant_id', user.id);
          }

          // Also ensure name is set
          const storedName = localStorage.getItem('pf_participant_name');
          if (!storedName && user.user_metadata?.full_name) {
            localStorage.setItem('pf_participant_name', user.user_metadata.full_name);
          }
        }
      } catch (err) {
        console.error('Error syncing participant ID:', err);
      }
    };

    syncParticipantId();
  }, []);

  // Also sync when session data loads (in case session was created by this user)
  useEffect(() => {
    if (!data?.session || !isClient) return;

    const migrateParticipantId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const storedId = localStorage.getItem('pf_participant_id');

        // If user is authenticated and session creator matches user.id
        // but localStorage has different ID, fix it
        if (user?.id && data.session.created_by === user.id && storedId !== user.id) {
          console.log('Migrating participant ID from', storedId, 'to', user.id);
          localStorage.setItem('pf_participant_id', user.id);

          // Preserve user name if available
          const storedName = localStorage.getItem('pf_participant_name');
          if (!storedName && user.user_metadata?.full_name) {
            localStorage.setItem('pf_participant_name', user.user_metadata.full_name);
          }
        }
      } catch (err) {
        console.error('Error migrating participant ID:', err);
      }
    };

    migrateParticipantId();
  }, [data?.session, isClient]);

  const participantId = isClient ? localStorage.getItem('pf_participant_id') : null;
  const participantName = isClient ? localStorage.getItem('pf_participant_name') : null;

  const currentParticipant = data?.participants.find(
    (p) => p.participant_id === participantId
  );

  const isCreator = data?.session?.created_by === participantId;
  const isFacilitator = currentParticipant?.is_facilitator || isCreator || false;

  // Redirect non-facilitators (only after client-side sync is complete)
  useEffect(() => {
    if (!loading && data && isClient && !isFacilitator && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error('Access restricted', {
        description: 'Only the facilitator can create the final statement.',
      });
      router.push(`/tools/problem-framing/${sessionId}/review`);
    }
  }, [loading, data, isFacilitator, router, sessionId, isClient]);

  async function handleFinalize(statement: string) {
    if (!participantId || !participantName) {
      toast.error('Participant information not found', {
        description: 'Please rejoin the session.',
      });
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
      toast.error('Failed to finalize statement', {
        description: 'Please try again.',
      });
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Timeline */}
        <div className="mb-12">
          <SessionTimeline currentStep={4} size="compact" />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Final Consensus
          </h1>
        </div>

        {/* Tips Section */}
        {showTips && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 relative">
            <button
              onClick={() => setShowTips(false)}
              className="absolute top-4 right-4 text-blue-600 hover:text-blue-800 transition-colors"
              aria-label="Dismiss tips"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex gap-3 pr-8">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="text-sm text-blue-900">
                <p className="font-semibold text-sm mb-2">Tips for a great problem statement:</p>
                <ul className="space-y-1.5 text-xs">
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
        )}

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          {/* Left: Reference Statements */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-[550px]">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Individual Perspectives ({statements.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-4">
                {statements.map((statement) => (
                  <StatementCard
                    key={statement.id}
                    statement={statement}
                    currentParticipantId={participantId || ''}
                    onPin={async () => { }} // No pin functionality on this page
                    showPin={false}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Final Statement Editor */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5 h-[550px] flex flex-col">
              <FinalStatementEditor
                initialValue={initialValue}
                onFinalize={handleFinalize}
                loading={finalizing}
              />
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
