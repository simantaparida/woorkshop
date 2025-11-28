'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { TopicForm } from '@/components/problem-framing/TopicForm';
import { FileText } from 'lucide-react';

export default function NewProblemFramingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreateSession(data: { title: string; description?: string }) {
    setLoading(true);

    try {
      // Get or create participant ID (used for both facilitator and participants)
      let participantId = localStorage.getItem('pf_participant_id');
      let participantName = localStorage.getItem('pf_participant_name');

      if (!participantId || !participantName) {
        participantId = crypto.randomUUID();
        participantName = prompt('Enter your name:') || 'Facilitator';
        localStorage.setItem('pf_participant_id', participantId);
        localStorage.setItem('pf_participant_name', participantName);
      }

      // Create session via API
      const response = await fetch('/api/tools/problem-framing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          facilitatorId: participantId,
          facilitatorName: participantName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const { sessionId } = await response.json();

      // Store session ID
      localStorage.setItem('pf_current_session_id', sessionId);

      // Navigate to join page
      router.push(`/tools/problem-framing/${sessionId}/join`);
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ToolLayout toolSlug="problem-framing" currentStep={1} totalSteps={5}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Problem Framing Session
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Define and understand problems before jumping to solutions. Create a collaborative session where your team can share perspectives and build a common understanding.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Define Your Topic
          </h2>
          <TopicForm onSubmit={handleCreateSession} loading={loading} />
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">1.</span>
              <span>Define the topic you want to frame</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">2.</span>
              <span>Participants join and individually describe the problem (hidden from others)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">3.</span>
              <span>Review all problem statements together as a team</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">4.</span>
              <span>Create a final agreed problem statement</span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-blue-600">5.</span>
              <span>Export and share the summary</span>
            </li>
          </ol>
        </div>
      </div>
    </ToolLayout>
  );
}
