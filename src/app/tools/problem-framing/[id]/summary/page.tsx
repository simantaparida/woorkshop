'use client';

import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { SessionSummary } from '@/components/problem-framing/SessionSummary';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { Home, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);

  function handleExportPDF() {
    // PDF export implementation
    // For now, show a message that this feature is coming soon
    alert('PDF export will be available soon! For now, please use the "Copy as Markdown" option.');
  }

  function handleCopyMarkdown() {
    if (!data) return;

    // Generate markdown format
    let markdown = `# ${data.topic_title}\n\n`;

    if (data.topic_description) {
      markdown += `${data.topic_description}\n\n`;
    }

    markdown += `**Session Date:** ${new Date(data.session.created_at).toLocaleDateString()}\n`;
    markdown += `**Participants:** ${data.participants.length}\n\n`;

    markdown += `---\n\n`;

    // Final Statement
    if (data.final_statement) {
      markdown += `## Final Agreed Problem Statement\n\n`;
      markdown += `${data.final_statement.statement}\n\n`;
      markdown += `*Finalized by ${data.final_statement.finalized_by_participant_name} on ${new Date(data.final_statement.finalized_at).toLocaleString()}*\n\n`;
      markdown += `---\n\n`;
    }

    // Individual Submissions
    if (data.individual_statements.length > 0) {
      markdown += `## Individual Perspectives\n\n`;
      data.individual_statements.forEach((stmt, index) => {
        markdown += `### ${index + 1}. ${stmt.participant_name}\n\n`;
        markdown += `${stmt.statement}\n\n`;
        if (stmt.pin_count && stmt.pin_count > 0) {
          markdown += `*Pinned by ${stmt.pin_count} participant${stmt.pin_count > 1 ? 's' : ''}*\n\n`;
        }
      });
      markdown += `---\n\n`;
    }

    // Participants
    markdown += `## Participants\n\n`;
    data.participants.forEach(participant => {
      markdown += `- ${participant.participant_name}`;
      if (participant.is_facilitator) {
        markdown += ` (Facilitator)`;
      }
      markdown += `\n`;
    });

    markdown += `\n---\n\n`;
    markdown += `*Generated with UX Play - Problem Framing Tool*\n`;

    // Copy to clipboard
    navigator.clipboard.writeText(markdown).then(() => {
      // Success feedback is shown via the component
    }).catch(err => {
      console.error('Failed to copy markdown:', err);
      alert('Failed to copy to clipboard. Please try again.');
    });
  }

  function handleFinish() {
    router.push('/home');
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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Session Complete!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your team has successfully framed the problem. Here is a summary of what you achieved.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 p-8 mb-8">
          <SessionSummary
            data={data}
            onExportPDF={handleExportPDF}
            onCopyMarkdown={handleCopyMarkdown}
          />
        </div>

        <div className="flex justify-center">
          <Button
            onClick={handleFinish}
            variant="outline"
            size="lg"
            className="px-8 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
