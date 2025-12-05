'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

interface StatementInputProps {
  topicTitle: string;
  topicDescription?: string;
  onSubmit: (statement: string) => Promise<void>;
  loading?: boolean;
}

export function StatementInput({
  topicTitle,
  topicDescription,
  onSubmit,
  loading,
}: StatementInputProps) {
  const [statement, setStatement] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = statement.length;
  const minChars = 10;
  const isValid = charCount >= minChars;

  // Handle mobile keyboard appearing
  const handleFocus = () => {
    // Delay to allow keyboard animation to complete
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 300);
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;

    // Optimistic update
    setSubmitted(true);
    setIsSubmitting(true);

    try {
      await onSubmit(statement);
      // Success confirmed
      toast.success('Statement submitted!', {
        description: 'Your input has been recorded.',
      });
    } catch (error) {
      // Rollback on error
      setSubmitted(false);
      toast.error('Failed to submit statement', {
        description: 'Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{topicTitle}</h2>
        {topicDescription && (
          <p className="text-gray-700">{topicDescription}</p>
        )}
      </div>

      <div>
        <label htmlFor="statement" className="block text-lg font-medium text-gray-900 mb-2">
          How do you frame this problem?
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Describe the problem as you see it. Your response will remain hidden from other participants until the review step.
        </p>
        <textarea
          ref={textareaRef}
          id="statement"
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          onFocus={handleFocus}
          placeholder="Describe the problem from your perspective..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-base"
          disabled={loading || submitted || isSubmitting}
          autoFocus
        />
        <div className="flex justify-between items-center mt-2">
          <span className={`text-sm ${charCount < minChars ? 'text-gray-400' : 'text-gray-600'}`}>
            {charCount} characters {charCount < minChars && `(minimum ${minChars})`}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          variant="primary"
          size="lg"
          disabled={!isValid || loading || submitted || isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : submitted ? 'Submitted!' : 'Submit Statement'}
        </Button>
      </div>
    </div>
  );
}
