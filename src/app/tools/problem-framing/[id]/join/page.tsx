'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { JoinForm } from '@/components/problem-framing/JoinForm';
import { ShareLink } from '@/components/problem-framing/ShareLink';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { Users, ArrowRight, FileText, Link as LinkIcon, Image as ImageIcon, Paperclip, CheckCircle2, ChevronLeft, Copy } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function JoinPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);
  const [hasJoined, setHasJoined] = useState(false);
  const [joiningLoading, setJoiningLoading] = useState(false);

  // Derived state for immediate feedback
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Sync localStorage with authenticated user ID
    const syncParticipantId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user?.id) {
          const storedId = localStorage.getItem('pf_participant_id');

          // If stored ID differs from user ID, update it
          if (storedId !== user.id) {
            localStorage.setItem('pf_participant_id', user.id);
          }
        }
      } catch (err) {
        console.error('Error syncing participant ID:', err);
      }
    };

    syncParticipantId();
  }, []);

  const participantId = isClient ? localStorage.getItem('pf_participant_id') : null;
  const isParticipant = data?.participants?.some((p) => p.participant_id === participantId);
  const isCreator = data?.session?.created_by === participantId;

  // User is considered joined if they are in the list OR they are the creator
  const effectiveHasJoined = hasJoined || isParticipant || isCreator || false;

  useEffect(() => {
    // Auto-advance logic
    if (effectiveHasJoined && data) {
      const currentParticipant = data.participants?.find((p) => p.participant_id === participantId);
      const isFacilitator = currentParticipant?.is_facilitator || isCreator || false;

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
  }, [effectiveHasJoined, data, router, sessionId, participantId, isCreator]);

  useEffect(() => {
    // Migration: Fix existing sessions with mismatched IDs
    const migrateParticipantId = async () => {
      if (!data?.session || !isClient) return;

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
      toast.error('Failed to join session', {
        description: 'Please try again.',
      });
    } finally {
      setJoiningLoading(false);
    }
  }

  async function handleStart() {
    try {
      const facilitatorId = localStorage.getItem('pf_participant_id');

      if (!facilitatorId) {
        toast.error('Facilitator ID not found', {
          description: 'Please refresh and try again.',
        });
        return;
      }

      // Update session status to 'input' so participants can submit
      const response = await fetch(`/api/tools/problem-framing/${sessionId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nextStep: 2,
          facilitatorId
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start session');
      }

      router.push(`/tools/problem-framing/${sessionId}/input`);
    } catch (error) {
      console.error('Error starting session:', error);
      const message = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Failed to start session', {
        description: message,
      });
    }
  }

  // Calculate isFacilitator for render
  const currentParticipant = data?.participants?.find(
    (p) => p.participant_id === participantId
  );
  const isFacilitator = currentParticipant?.is_facilitator || isCreator || false;

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
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

        {/* Timeline - Step 1 (Setup/Join) */}
        <SessionTimeline currentStep={1} />

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {data?.topic_title || 'Problem Framing Session'}
          </h1>
          {data?.topic_description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {data.topic_description}
            </p>
          )}
        </div>

        {/* Session Context / Attachments - Below Topic Description */}
        {data?.attachments && data.attachments.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Paperclip className="w-5 h-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Session Context & Attachments</h3>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {data.attachments.map((att) => (
                <div key={att.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                  <div className="mt-1 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
                    {att.type === 'link' && <LinkIcon className="w-5 h-5 text-blue-500" />}
                    {att.type === 'image' && <ImageIcon className="w-5 h-5 text-purple-500" />}
                    {att.type === 'document' && <FileText className="w-5 h-5 text-orange-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate mb-1">{att.name}</p>
                    {att.type === 'link' ? (
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block flex items-center">
                        {att.url} <ArrowRight className="w-3 h-3 ml-1 inline" />
                      </a>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {att.type === 'image' ? 'Image Attachment' : 'Document Attachment'}
                      </div>
                    )}

                    {/* Image Preview */}
                    {att.type === 'image' && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                        <img src={att.url} alt={att.name} className="w-full h-32 object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="space-y-6">

          {/* Join / Lobby Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 overflow-hidden">
            <div className="p-8">
              {!effectiveHasJoined ? (
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Join the Session</h2>
                    <p className="text-gray-500">Enter your name to join the team</p>
                  </div>
                  <JoinForm onJoin={handleJoin} loading={joiningLoading} />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      You're in!
                    </h2>
                    <p className="text-gray-600">
                      Waiting for the facilitator to start the session...
                    </p>
                  </div>

                  {/* Share Link - Prominent */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                    <p className="text-sm font-semibold text-blue-900 mb-3">
                      Invite your team to join
                    </p>
                    <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                      <code className="flex-1 bg-white px-4 py-3 rounded-lg border border-blue-200 text-sm text-gray-600 truncate font-mono">
                        {typeof window !== 'undefined' ? window.location.href : ''}
                      </code>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('Link copied!', {
                            description: 'Share it with your team.',
                          });
                        }}
                        className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>

                  {/* Participants List */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      Participants ({data?.participants.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data?.participants.map((participant) => {
                        const isCurrentUser = participant.participant_id === participantId;

                        return (
                          <div
                            key={participant.id}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg border shadow-sm ${
                              isCurrentUser
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <span className="text-gray-900 font-medium">
                              {participant.participant_name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600">(You)</span>
                              )}
                            </span>
                            {participant.is_facilitator && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold uppercase tracking-wide">
                                Host
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Facilitator Controls */}
                  {isFacilitator && (
                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        onClick={handleStart}
                        variant="primary"
                        size="lg"
                        className="w-full py-4 text-lg font-semibold shadow-lg shadow-blue-200/50 hover:shadow-blue-300/50 transition-all"
                      >
                        Start Session
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <p className="text-sm text-center text-gray-500 mt-3">
                        Click when everyone has joined
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
