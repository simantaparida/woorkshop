'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppLayout } from '@/components/AppLayout';
import { ROUTES } from '@/lib/constants';

/**
 * Voting Board Session Page
 * 
 * This page redirects to the standard session lobby since Voting Board
 * now uses the same session API and flow as regular sessions.
 * 
 * Voting Board flow:
 * 1. Create at /voting-board/new → creates session via API → redirects to /session/[id]/lobby
 * 2. Users can access via /voting-board/[id] → redirects to /session/[id]/lobby
 * 3. Standard flow: lobby → vote → results
 */
export default function VotingBoardSessionPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.id as string;

  useEffect(() => {
    if (sessionId) {
      // Redirect to the standard session lobby
      router.replace(ROUTES.LOBBY(sessionId));
    }
  }, [sessionId, router]);

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to session...</p>
        </div>
      </div>
    </AppLayout>
  );
}
