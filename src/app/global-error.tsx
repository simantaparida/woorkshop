'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Global error boundary for the entire application
 * This catches errors that occur during rendering, in lifecycle methods,
 * and in constructors of the whole tree below them.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/error-handling
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong!
              </h2>
              <p className="text-gray-600 mb-6">
                We apologize for the inconvenience. Our team has been notified and
                is working to fix the issue.
              </p>
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 text-left">
                  <details className="bg-gray-100 p-4 rounded">
                    <summary className="cursor-pointer font-medium text-gray-900">
                      Error Details (Development Only)
                    </summary>
                    <pre className="mt-2 text-xs text-red-600 overflow-auto">
                      {error.message}
                      {error.stack}
                    </pre>
                  </details>
                </div>
              )}
              <div className="flex gap-4 justify-center">
                <Button onClick={() => reset()} variant="primary">
                  Try again
                </Button>
                <Button
                  onClick={() => (window.location.href = '/')}
                  variant="secondary"
                >
                  Go home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
