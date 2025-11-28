'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileCheck } from 'lucide-react';

interface FinalStatementEditorProps {
  initialValue?: string;
  onFinalize: (statement: string) => void;
  loading?: boolean;
}

export function FinalStatementEditor({
  initialValue = '',
  onFinalize,
  loading,
}: FinalStatementEditorProps) {
  const [statement, setStatement] = useState(initialValue);
  const charCount = statement.length;
  const isValid = charCount >= 10;

  const handleFinalize = () => {
    if (isValid) {
      onFinalize(statement);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FileCheck className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Create the Team's Agreed Problem Statement
            </h3>
            <p className="text-sm text-gray-700">
              Based on all individual submissions, craft a final statement that captures the team's shared understanding of the problem.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="final-statement" className="block text-sm font-medium text-gray-700 mb-2">
          Final Problem Statement
        </label>
        <textarea
          id="final-statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder="Write the final agreed problem statement..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-base"
          disabled={loading}
          autoFocus
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm ${charCount < 10 ? 'text-gray-400' : 'text-gray-600'}`}>
            {charCount} characters {charCount < 10 && '(minimum 10)'}
          </span>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Once you finalize this statement, the session will be marked as completed and you'll be redirected to the summary page.
        </p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleFinalize}
          variant="primary"
          size="lg"
          disabled={!isValid || loading}
        >
          {loading ? 'Finalizing...' : 'Finalize & Lock Statement'}
        </Button>
      </div>
    </div>
  );
}
