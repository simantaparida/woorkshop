'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { ROUTES } from '@/lib/constants';
import { AppLayout } from '@/components/AppLayout';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const { session, loading, error } = useSession(sessionId);

  useEffect(() => {
    if (!loading && session) {
      // Redirect based on session status
      if (session.status === 'open') {
        router.push(ROUTES.LOBBY(sessionId));
      } else if (session.status === 'playing') {
        router.push(ROUTES.VOTE(sessionId));
      } else if (session.status === 'results') {
        router.push(ROUTES.RESULTS(sessionId));
      }
    }
  }, [session, loading, router, sessionId]);

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Loading state
  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Loading session...</p>
      </div>
    </AppLayout>
  );
}
