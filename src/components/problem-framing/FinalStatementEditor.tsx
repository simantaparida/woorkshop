'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charCount = statement.length;
  const isValid = charCount >= 10;

  // Handle mobile keyboard appearing
  const handleFocus = () => {
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  };

  const handleFinalize = () => {
    if (isValid) {
      onFinalize(statement);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Create the Team's Agreed Problem Statement
        </h3>
        <p className="text-sm text-gray-600">
          Based on all individual submissions, craft a final statement that captures the team's shared understanding of the problem.
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <textarea
          ref={textareaRef}
          id="final-statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          onFocus={handleFocus}
          placeholder="Write the final problem statement here..."
          className="flex-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-base"
          disabled={loading}
          autoFocus
        />
        <div className="flex justify-between items-center mt-2 flex-shrink-0">
          <span className={`text-sm ${charCount < 10 ? 'text-gray-400' : 'text-gray-600'}`}>
            {charCount} characters {charCount < 10 && '(minimum 10)'}
          </span>
        </div>
      </div>

      <div className="flex justify-end flex-shrink-0">
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
