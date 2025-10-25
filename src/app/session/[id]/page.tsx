'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from '@/lib/hooks/useSession';
import { ROUTES } from '@/lib/constants';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const { session, loading } = useSession(sessionId);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Session Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This session does not exist or has been deleted.
          </p>
          <button
            onClick={() => router.push(ROUTES.HOME)}
            className="text-primary hover:underline"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}
