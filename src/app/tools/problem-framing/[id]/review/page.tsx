'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { StatementCard } from '@/components/problem-framing/StatementCard';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, Eye, AlertCircle, Star } from 'lucide-react';

export default function TeamReviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);
  const [isClient, setIsClient] = useState(false);

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

  // Auto-navigate participants when facilitator advances session
  useEffect(() => {
    if (!data || isFacilitator) return;

    const statusToRoute: Record<string, string> = {
      // Non-facilitators should NOT be auto-navigated to finalize page (they don't have access)
      // They should only be navigated to summary when it's complete
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
      toast.error('Failed to toggle pin', {
        description: 'Please try again.',
      });
      throw error; // Re-throw so StatementCard can handle rollback
    }
  }

  async function handleAdvanceToFinalize() {
    try {
      const facilitatorId = localStorage.getItem('pf_participant_id');

      if (!facilitatorId) {
        toast.error('Facilitator ID not found', {
          description: 'Please refresh and try again.',
        });
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
      toast.error('Failed to advance to next step', {
        description: message,
      });
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Timeline */}
        <div className="mb-12">
          <SessionTimeline currentStep={3} size="compact" />
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Team Review
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Review all problem statements submitted by the team. Read through different perspectives and pin the ones that resonate most.
          </p>
        </div>

        {/* Topic Display */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-600">
              <Eye className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">{data.topic_title}</h2>
              {data.topic_description && (
                <p className="text-sm text-gray-600 leading-relaxed">{data.topic_description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Statements Grid */}
        {statements.length > 0 ? (
          <div className="space-y-6 mb-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Individual Perspectives ({statements.length})
                </h3>
              </div>
              <div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 flex items-center gap-2">
                <Star className="w-3.5 h-3.5 text-blue-600" />
                <span>Click stars to pin insights</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
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
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center mb-8">
            <p className="text-sm text-gray-500 font-medium">No statements submitted yet</p>
          </div>
        )}

        {/* Facilitator Controls */}
        {isFacilitator ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 sticky bottom-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-base mb-1">
                    Facilitator Actions
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Once the team has reviewed all perspectives, proceed to create the final agreed problem statement.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleAdvanceToFinalize}
                variant="primary"
                size="lg"
                className="w-full md:w-auto px-5 py-3 text-base font-semibold shadow-lg whitespace-nowrap flex-shrink-0"
              >
                Create Final Statement
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          /* Info Box for Participants */
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
            <p className="text-sm text-blue-800 font-medium">
              Waiting for facilitator to advance to the final consensus step...
            </p>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
