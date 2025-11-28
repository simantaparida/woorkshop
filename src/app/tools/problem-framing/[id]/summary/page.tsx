'use client';

import { useParams, useRouter } from 'next/navigation';
import { ToolLayout } from '@/components/ToolLayout';
import { SessionSummary } from '@/components/problem-framing/SessionSummary';
import { Button } from '@/components/ui/Button';
import { useProblemFramingSession } from '@/lib/hooks/useProblemFramingSession';
import { Home } from 'lucide-react';

export default function SummaryPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data, loading } = useProblemFramingSession(sessionId);

  function handleExportPDF() {
    // PDF export implementation
    // For now, show a message that this feature is coming soon
    alert('PDF export will be available soon! For now, please use the "Copy as Markdown" option.');

    // Future implementation could use jspdf + html2canvas:
    // import jsPDF from 'jspdf';
    // import html2canvas from 'html2canvas';
    //
    // const element = document.getElementById('pf-summary-content');
    // if (!element) return;
    //
    // html2canvas(element).then(canvas => {
    //   const imgData = canvas.toDataURL('image/png');
    //   const pdf = new jsPDF('p', 'mm', 'a4');
    //   const pdfWidth = pdf.internal.pageSize.getWidth();
    //   const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    //   pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    //   pdf.save(`problem-framing-${sessionId}.pdf`);
    // });
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
      <ToolLayout toolSlug="problem-framing" currentStep={5} totalSteps={5}>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </ToolLayout>
    );
  }

  if (!data) {
    return (
      <ToolLayout toolSlug="problem-framing" currentStep={5} totalSteps={5}>
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">Session not found</p>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout toolSlug="problem-framing" currentStep={5} totalSteps={5}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Session Summary
            </h1>
            <p className="text-gray-600">
              Review and export the complete problem framing session results
            </p>
          </div>
          <Button
            onClick={handleFinish}
            variant="outline"
            size="md"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <SessionSummary
            data={data}
            onExportPDF={handleExportPDF}
            onCopyMarkdown={handleCopyMarkdown}
          />
        </div>

        {/* Completion Message */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Session Complete!
          </h3>
          <p className="text-gray-600">
            Your team has successfully framed the problem. Use the final statement to guide your next steps.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
