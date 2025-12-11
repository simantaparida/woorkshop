'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Session } from '@/types';

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    const activeSessionId = sessionId; // Capture non-null value
    let isSubscribed = true;

    async function fetchSession() {
      try {
        const { data, error} = await supabase
          .from('sessions_unified')
          .select('*')
          .eq('id', activeSessionId)
          .single();

        if (error) throw error;

        if (isSubscribed) {
          // Always update session to trigger re-renders even if data looks the same
          setSession(prevSession => {
            // Log if status changed
            if (prevSession?.status !== data?.status) {
              console.log('[useSession] Status changed from', prevSession?.status, 'to', data?.status);
            }
            return data;
          });
          setLoading(false);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to load session');
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchSession();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions_unified',
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Session updated:', payload.new);
          setSession(payload.new as Session);
        }
      )
      .subscribe((status) => {
        console.log('Session realtime subscription status:', status);
      });

    // Fallback: Poll for updates every 2 seconds as backup if realtime doesn't work
    const pollInterval = setInterval(() => {
      fetchSession();
    }, 2000);

    return () => {
      isSubscribed = false;
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [sessionId]);

  return { session, loading, error };
}
