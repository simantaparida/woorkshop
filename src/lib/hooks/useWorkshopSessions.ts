'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { WorkshopSessionData } from '@/types';

/**
 * Hook to fetch recent sessions (last 5) for a user
 * Replaces workshop-based session fetching with direct session management
 */
export function useWorkshopSessions(userId: string | null) {
  const [sessions, setSessions] = useState<WorkshopSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Expose refetch function
  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setSessions([]);
      return;
    }

    let isSubscribed = true;

    async function fetchSessions() {
      try {
        const response = await fetch(`/api/recent-sessions?userId=${userId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data = await response.json();

        if (isSubscribed) {
          setSessions(data.sessions || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to load sessions');
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchSessions();

    // Subscribe to sessions_unified changes for the user
    const sessionsChannel = supabase
      .channel(`recent_sessions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions_unified',
          filter: `created_by=eq.${userId}`,
        },
        () => {
          console.log('Session updated, refetching recent sessions...');
          fetchSessions();
        }
      )
      .subscribe((status) => {
        console.log('Recent sessions subscription status:', status);
      });

    // Subscribe to players changes (affects participant counts)
    const playersChannel = supabase
      .channel(`session_players:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        () => {
          console.log('Player updated, refetching sessions...');
          fetchSessions();
        }
      )
      .subscribe();

    // Subscribe to problem framing participants changes
    const pfParticipantsChannel = supabase
      .channel(`pf_participants:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_session_participants',
        },
        () => {
          console.log('PF participant updated, refetching sessions...');
          fetchSessions();
        }
      )
      .subscribe();

    // Polling fallback every 30 seconds
    const pollInterval = setInterval(() => {
      fetchSessions();
    }, 30000);

    return () => {
      isSubscribed = false;
      sessionsChannel.unsubscribe();
      playersChannel.unsubscribe();
      pfParticipantsChannel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [userId, refetchTrigger]);

  return { sessions, loading, error, refetch };
}
