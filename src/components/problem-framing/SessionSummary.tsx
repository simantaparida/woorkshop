'use client';

import { Button } from '@/components/ui/Button';
import { Download, Copy, CheckCircle } from 'lucide-react';
import type { PFSessionData } from '@/types';
import { useState } from 'react';

interface SessionSummaryProps {
  data: PFSessionData;
  onExportPDF: () => void;
  onCopyMarkdown: () => void;
}

export function SessionSummary({ data, onExportPDF, onCopyMarkdown }: SessionSummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = () => {
    onCopyMarkdown();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="pf-summary-content" className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.topic_title}</h1>
        {data.topic_description && (
          <p className="text-lg text-gray-600">{data.topic_description}</p>
        )}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>{data.participants.length} participants</span>
          <span>•</span>
          <span>{new Date(data.session.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Final Statement - Highlighted */}
      {data.final_statement && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-8">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
            <h2 className="text-2xl font-bold text-gray-900">Final Agreed Statement</h2>
          </div>
          <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-wrap mb-4">
            {data.final_statement.statement}
          </p>
          <div className="text-sm text-gray-600">
            Finalized by {data.final_statement.finalized_by_participant_name} on{' '}
            {new Date(data.final_statement.finalized_at).toLocaleString()}
          </div>
        </div>
      )}

      {/* Individual Submissions */}
      {data.individual_statements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Individual Submissions</h2>
          <div className="space-y-4">
            {data.individual_statements.map((stmt) => (
              <div
                key={stmt.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{stmt.participant_name}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(stmt.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  {stmt.pin_count !== undefined && stmt.pin_count > 0 && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <span className="text-sm font-medium">{stmt.pin_count} pins</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-900 whitespace-pre-wrap">{stmt.statement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants List */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Participants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.participants.map((participant) => (
            <div
              key={participant.id}
              className="bg-gray-50 rounded-lg px-4 py-3 flex items-center justify-between"
            >
              <span className="text-gray-900 font-medium">
                {participant.participant_name}
              </span>
              {participant.is_facilitator && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Facilitator
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Export Actions */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Summary</h3>
        <div className="flex flex-wrap gap-3">
          <Button onClick={onExportPDF} variant="outline" size="md">
            <Download className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>
          <Button onClick={handleCopyMarkdown} variant="outline" size="md">
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy as Markdown
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
