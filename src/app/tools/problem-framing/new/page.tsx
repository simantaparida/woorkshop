'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '@/lib/hooks/useUser';
import { AppLayout } from '@/components/AppLayout';
import { TopicForm } from '@/components/problem-framing/TopicForm';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { FileText } from 'lucide-react';
import { Attachment } from '@/components/problem-framing/AttachmentUpload';

export default function NewProblemFramingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useUser();

  async function handleCreateSession(data: {
    title: string;
    description?: string;
    facilitatorName: string;
    attachments: Attachment[];
  }) {
    // Check authentication - only authenticated users can create sessions
    if (!user) {
      toast.error('Please log in to create a session', {
        description: 'You need an account to create problem framing sessions.',
      });
      router.push(`/auth/login?redirect=${encodeURIComponent('/tools/problem-framing/new')}`);
      return;
    }

    setLoading(true);

    try {
      // Use authenticated user's ID
      const participantId = user.id;

      // Always store to ensure sync
      localStorage.setItem('pf_participant_id', participantId);

      // Save name to localStorage
      localStorage.setItem('pf_participant_name', data.facilitatorName);

      // Create session via API
      const response = await fetch('/api/tools/problem-framing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          facilitatorId: participantId,
          facilitatorName: data.facilitatorName,
          attachments: data.attachments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Failed to create session';
        throw new Error(errorMessage);
      }

      const { sessionId } = await response.json();

      // Store session ID
      localStorage.setItem('pf_current_session_id', sessionId);

      // Delay to ensure database transaction is committed and replicated
      // before navigating (prevents race condition with auto-add facilitator)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to join page
      router.push(`/tools/problem-framing/${sessionId}/join`);
    } catch (error) {
      console.error('Error creating session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create session';
      toast.error('Failed to create session', {
        description: errorMessage === 'Failed to create session'
          ? 'Please try again or contact support if the issue persists.'
          : errorMessage,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-8">
          {/* Minimalistic Timeline */}
          <SessionTimeline currentStep={1} />

          <div className="flex items-center gap-4 mb-4 mt-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              New Problem Framing Session
            </h1>
          </div>

          <p className="text-gray-600">
            Create a collaborative space for your team to define and understand the problem before jumping to solutions.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <TopicForm onSubmit={handleCreateSession} loading={loading} defaultName={user?.name} />
        </div>

      </div>
    </AppLayout>
  );
}
