'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { WorkshopSessionData } from '@/types';

export function useWorkshopSessions(userId: string | null) {
  const [sessions, setSessions] = useState<WorkshopSessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setSessions([]);
      return;
    }

    let isSubscribed = true;

    async function fetchSessions() {
      try {
        const response = await fetch('/api/recent-sessions');

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
      .channel(`workshop_sessions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions_unified',
          filter: `created_by=eq.${userId}`,
        },
        () => {
          console.log('Session updated, refetching...');
          fetchSessions();
        }
      )
      .subscribe((status) => {
        console.log('Workshop sessions subscription status:', status);
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

    // Polling fallback every 3 seconds
    const pollInterval = setInterval(() => {
      fetchSessions();
    }, 3000);

    return () => {
      isSubscribed = false;
      sessionsChannel.unsubscribe();
      playersChannel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [userId]);

  return { sessions, loading, error };
}
