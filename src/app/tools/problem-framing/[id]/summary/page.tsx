'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    if (!data) {
      toast.error('No data available', {
        description: 'Please wait for the session data to load.',
      });
      return;
    }

    try {
      const doc = new jsPDF();

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Problem Framing Session Results', 14, 20);

      // Metadata
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Topic: ${data.topic_title}`, 14, 30);
      doc.text(`Date: ${new Date(data.session.created_at).toLocaleDateString()}`, 14, 35);
      doc.text(`Participants: ${data.participants.length}`, 14, 40);

      let yPos = 50;

      // Final Statement
      if (data.final_statement) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Final Agreed Statement', 14, yPos);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const finalText = doc.splitTextToSize(
          data.final_statement.statement,
          180
        );
        doc.text(finalText, 14, yPos + 8);

        const finalTextHeight = finalText.length * 5;
        yPos += finalTextHeight + 18;
      }

      // Individual Statements Table
      if (data.individual_statements.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Individual Submissions', 14, yPos);
        yPos += 5;

        const tableData = data.individual_statements.map((stmt, idx) => [
          `${idx + 1}`,
          stmt.participant_name,
          stmt.statement,
          stmt.pin_count || 0
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [['#', 'Participant', 'Statement', 'Pins']],
          body: tableData,
          styles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 120 },
            3: { cellWidth: 15 }
          },
          headStyles: {
            fillColor: [37, 99, 235], // blue-600
            textColor: 255,
            fontStyle: 'bold'
          }
        });

        yPos = (doc as any).lastAutoTable.finalY + 10;
      }

      // Participants List
      if (yPos + 50 > doc.internal.pageSize.height) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Participants', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      data.participants.forEach((p, idx) => {
        const label = p.is_facilitator ? `${p.participant_name} (Facilitator)` : p.participant_name;
        doc.text(`${idx + 1}. ${label}`, 14, yPos + (idx * 5));
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Generated with UX Play on ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );

      // Save
      const filename = `problem-framing-${data.session.id.slice(0, 8)}.pdf`;
      doc.save(filename);

      toast.success('PDF exported successfully!', {
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to export PDF', {
        description: 'Please try again or use the Markdown option.',
      });
    }
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
      toast.success('Markdown copied!', {
        description: 'You can now paste it anywhere.',
      });
    }).catch(err => {
      console.error('Failed to copy markdown:', err);
      toast.error('Failed to copy to clipboard', {
        description: 'Please try again.',
      });
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
