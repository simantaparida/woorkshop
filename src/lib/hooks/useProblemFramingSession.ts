'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getPFSessionData } from '@/lib/api/problem-framing';
import type { PFSessionData } from '@/types';

interface UseProblemFramingSessionResult {
  data: PFSessionData | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for real-time Problem Framing session data
 *
 * Subscribes to changes in:
 * - Session participants
 * - Individual statements
 * - Statement pins
 * - Final statement
 *
 * Includes polling fallback for reliability
 */
export function useProblemFramingSession(sessionId: string): UseProblemFramingSessionResult {
  const [data, setData] = useState<PFSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch session data
  const fetchData = async () => {
    try {
      const sessionData = await getPFSessionData(sessionId);
      setData(sessionData);
      setError(null);
      return sessionData;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) {
      setError(new Error('Session ID is required'));
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Initial fetch
    fetchData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`pf_session:${sessionId}`)
      // Session changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tool_sessions',
          filter: `id=eq.${sessionId}`,
        },
        () => {
          fetchData();
        }
      )
      // Participant changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_session_participants',
          filter: `tool_session_id=eq.${sessionId}`,
        },
        () => {
          fetchData();
        }
      )
      // Individual statement changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_individual_statements',
          filter: `tool_session_id=eq.${sessionId}`,
        },
        () => {
          fetchData();
        }
      )
      // Statement pin changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_statement_pins',
        },
        () => {
          fetchData();
        }
      )
      // Final statement changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_final_statement',
          filter: `tool_session_id=eq.${sessionId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Polling fallback (every 3 seconds)
    const pollingInterval = setInterval(() => {
      fetchData();
    }, 3000);

    // Cleanup
    return () => {
      channel.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [sessionId]);

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  };
}
