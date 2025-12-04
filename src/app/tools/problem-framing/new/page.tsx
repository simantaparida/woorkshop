'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { TopicForm } from '@/components/problem-framing/TopicForm';
import { SessionTimeline } from '@/components/problem-framing/SessionTimeline';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Attachment } from '@/components/problem-framing/AttachmentUpload';

export default function NewProblemFramingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreateSession(data: {
    title: string;
    description?: string;
    facilitatorName: string;
    attachments: Attachment[];
  }) {
    setLoading(true);

    try {
      // Get or create participant ID
      let participantId = localStorage.getItem('pf_participant_id');

      if (!participantId) {
        participantId = crypto.randomUUID();
        localStorage.setItem('pf_participant_id', participantId);
      }

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
        throw new Error('Failed to create session');
      }

      const { sessionId } = await response.json();

      // Store session ID
      localStorage.setItem('pf_current_session_id', sessionId);

      // Small delay to ensure database transaction is committed
      // before navigating (prevents race condition with auto-add facilitator)
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to join page
      router.push(`/tools/problem-framing/${sessionId}/join`);
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session', {
        description: 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-8">
          <Link
            href="/tools"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Tools
          </Link>

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
          <TopicForm onSubmit={handleCreateSession} loading={loading} />
        </div>

      </div>
    </AppLayout>
  );
}
