'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Check, Copy } from 'lucide-react';

interface ShareLinkProps {
  sessionId: string;
  className?: string;
}

export function ShareLink({ sessionId, className = '' }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/tools/problem-framing/${sessionId}/join`
    : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <p className="text-sm text-gray-700 mb-2 font-medium">
        Share this link with participants:
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={joinUrl}
          className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
          onClick={(e) => e.currentTarget.select()}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
