'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { StatementInput } from '@/components/problem-framing/StatementInput';
import { ShareLink } from '@/components/problem-framing/ShareLink';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { supabase } from '@/lib/supabase/client';
import { ArrowRight, Users, CheckCircle2, Clock, AlertCircle, Paperclip, FileText, Link as LinkIcon, Image as ImageIcon, ChevronLeft } from 'lucide-react';

export default function IndividualInputPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);
  const [submitting, setSubmitting] = useState(false);
  const [advancing, setAdvancing] = useState(false);
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
  const hasSubmitted = currentParticipant?.has_submitted || false;

  // Auto-navigate participants when facilitator advances session
  useEffect(() => {
    if (!data || isFacilitator) return;

    const statusToRoute: Record<string, string> = {
      'review': `/tools/problem-framing/${sessionId}/review`,
      'finalize': `/tools/problem-framing/${sessionId}/finalize`,
      'summary': `/tools/problem-framing/${sessionId}/summary`,
      'completed': `/tools/problem-framing/${sessionId}/summary`,
    };

    const nextRoute = statusToRoute[data.session.status];
    if (nextRoute) {
      router.push(nextRoute);
    }
  }, [data?.session.status, isFacilitator, router, sessionId]);

  // Calculate participant stats (excluding facilitator from counts only)
  const regularParticipants = data?.participants.filter(p => !p.is_facilitator) || [];
  const submittedCount = regularParticipants.filter(p => p.has_submitted).length;
  const totalRegularParticipants = regularParticipants.length;

  // All participants for display (including facilitator)
  const allParticipants = data?.participants || [];

  async function handleSubmit(statement: string) {
    if (!participantId || !participantName) {
      toast.error('Participant information not found', {
        description: 'Please rejoin the session.',
      });
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
      toast.error('Failed to submit statement', {
        description: 'Please try again.',
      });
      throw error; // Re-throw so StatementInput can handle rollback
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAdvanceToReview() {
    setAdvancing(true);

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
        body: JSON.stringify({ nextStep: 3, facilitatorId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to advance step');
      }

      router.push(`/tools/problem-framing/${sessionId}/review`);
    } catch (error) {
      console.error('Error advancing step:', error);
      const message = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Failed to advance to next step', {
        description: message,
      });
    } finally {
      setAdvancing(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Session Not Found</h2>
          <p className="text-gray-600">The session you are looking for does not exist or has ended.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tools')}
            className="text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Tools
          </Button>
        </div>

        {/* Timeline */}
        <SessionTimeline currentStep={2} size="compact" />

        {/* FACILITATOR VIEW */}
        {isFacilitator ? (
          <div className="space-y-6">

            {/* Session Content: Problem Title, Description, and Attachments */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              {/* Problem Title */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Problem</h3>
                <p className="text-base font-semibold text-gray-900">{data.topic_title}</p>
              </div>

              {/* Problem Description */}
              {data.topic_description && (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</h3>
                  <p className="text-sm text-gray-700">{data.topic_description}</p>
                </div>
              )}

              {/* Attachments */}
              {data?.attachments && data.attachments.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    Session Context & Attachments
                  </h3>

                  <div className="space-y-2">
                    {data.attachments.map((att) => (
                      <div key={att.id} className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {att.type === 'link' && <LinkIcon className="w-4 h-4 text-blue-500" />}
                          {att.type === 'image' && <ImageIcon className="w-4 h-4 text-purple-500" />}
                          {att.type === 'document' && <FileText className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-0.5">{att.name}</p>
                          {att.type === 'link' ? (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                              {att.url}
                            </a>
                          ) : (
                            <p className="text-xs text-gray-500">
                              {att.type === 'image' ? 'Image Attachment' : 'Document Attachment'}
                            </p>
                          )}

                          {/* Image Preview */}
                          {att.type === 'image' && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                              <img src={att.url} alt={att.name} className="w-full h-24 object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Facilitator's Own Input (Optional) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 p-6">
              {!hasSubmitted ? (
                <div>
                  <div className="mb-5">
                    <h2 className="text-lg font-bold text-gray-900 mb-1.5">
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
              ) : (
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-xl border border-green-100">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">You've submitted your input</p>
                    <p className="text-xs text-green-700">Your perspective has been added to the session</p>
                  </div>
                </div>
              )}
            </div>

            {/* Participant Status Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Participant Progress
                    </h2>
                    <p className="text-sm text-gray-600">
                      {submittedCount} of {totalRegularParticipants} submitted
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {totalRegularParticipants > 0 ? Math.round((submittedCount / totalRegularParticipants) * 100) : 0}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${totalRegularParticipants > 0 ? (submittedCount / totalRegularParticipants) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Share Link - Now inside Participant Progress */}
              <div className="mb-5 pb-5 border-b border-gray-100">
                <ShareLink sessionId={sessionId} />
              </div>

              {/* Participant List */}
              <div className="space-y-2.5 mb-6">
                {allParticipants.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-500 font-medium">No participants yet</p>
                    <p className="text-xs text-gray-400 mt-1">Share the link to invite others</p>
                  </div>
                ) : (
                  allParticipants.map((participant) => {
                    const isCurrentUser = participant.participant_id === participantId;

                    return (
                      <div
                        key={participant.id}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                          isCurrentUser
                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                            : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-medium">
                            {participant.participant_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-blue-600">(You)</span>
                            )}
                          </span>
                          {participant.is_facilitator && (
                            <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                              Host
                            </span>
                          )}
                        </div>
                        {participant.has_submitted ? (
                          <div className="flex items-center gap-1.5 text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Submitted</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">Thinking...</span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Facilitator Actions */}
              <div className="pt-5 border-t border-gray-100">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                  <p className="text-sm text-blue-800 flex gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Facilitator Note:</strong> Advance to the next step when you feel enough inputs have been gathered. You don't need to wait for everyone.
                    </span>
                  </p>
                </div>

                <Button
                  onClick={handleAdvanceToReview}
                  variant="primary"
                  size="lg"
                  className="w-full py-3 text-base font-bold shadow-lg shadow-blue-200/50"
                  disabled={submittedCount === 0 || advancing}
                >
                  {advancing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Advancing...
                    </>
                  ) : (
                    <>
                      Proceed to Team Review
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                {submittedCount === 0 && (
                  <p className="text-xs text-center text-gray-500 mt-2">
                    Waiting for at least one submission...
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* PARTICIPANT VIEW */
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Privacy Mode Alert - Top */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-2.5">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-amber-600">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-900 mb-1">Privacy Mode Active</h3>
                <p className="text-xs text-amber-800">
                  Your statement will be hidden from others until the review step to prevent groupthink.
                </p>
              </div>
            </div>

            {/* Session Content: Problem Title, Description, and Attachments */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              {/* Problem Title */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Problem</h3>
                <p className="text-base font-semibold text-gray-900">{data.topic_title}</p>
              </div>

              {/* Problem Description */}
              {data.topic_description && (
                <div className="mb-5 pb-5 border-b border-gray-100">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Description</h3>
                  <p className="text-sm text-gray-700">{data.topic_description}</p>
                </div>
              )}

              {/* Attachments */}
              {data?.attachments && data.attachments.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5" />
                    Session Context & Attachments
                  </h3>

                  <div className="space-y-2">
                    {data.attachments.map((att) => (
                      <div key={att.id} className="flex items-start gap-2.5">
                        <div className="mt-0.5">
                          {att.type === 'link' && <LinkIcon className="w-4 h-4 text-blue-500" />}
                          {att.type === 'image' && <ImageIcon className="w-4 h-4 text-purple-500" />}
                          {att.type === 'document' && <FileText className="w-4 h-4 text-orange-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-0.5">{att.name}</p>
                          {att.type === 'link' ? (
                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">
                              {att.url}
                            </a>
                          ) : (
                            <p className="text-xs text-gray-500">
                              {att.type === 'image' ? 'Image Attachment' : 'Document Attachment'}
                            </p>
                          )}

                          {/* Image Preview */}
                          {att.type === 'image' && (
                            <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                              <img src={att.url} alt={att.name} className="w-full h-24 object-cover" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Input Form Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 p-6">
              {!hasSubmitted ? (
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-1.5">Your Perspective</h2>
                    <p className="text-sm text-gray-600">
                      Describe the problem from your perspective. Be specific and focus on the "what" and "why".
                    </p>
                  </div>
                  <StatementInput
                    topicTitle={data.topic_title}
                    topicDescription={data.topic_description || undefined}
                    onSubmit={handleSubmit}
                    loading={submitting}
                  />
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5 animate-bounce">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Input Submitted!
                  </h2>
                  <p className="text-base text-gray-600 mb-6 max-w-md mx-auto">
                    Great job! Sit tight while the rest of the team finishes up.
                  </p>

                  <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-full">
                    <div className="flex -space-x-2">
                      {[...Array(Math.min(3, submittedCount))].map((_, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {submittedCount} of {totalRegularParticipants} ready
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
