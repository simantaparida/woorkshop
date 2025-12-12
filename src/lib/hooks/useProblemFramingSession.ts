'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
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
  const previousDataRef = useRef<PFSessionData | null>(null);

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

  // Real-time event notifications
  useEffect(() => {
    if (!data || !previousDataRef.current) {
      previousDataRef.current = data;
      return;
    }

    const prev = previousDataRef.current;

    // New participant joined
    if (data.participants.length > prev.participants.length) {
      const newParticipant = data.participants[data.participants.length - 1];
      toast.info(`${newParticipant.participant_name} joined the session`, {
        icon: '👋',
        duration: 3000,
      });
    }

    // Session phase changed
    if (data.session.status !== prev.session.status) {
      const phaseNames: Record<string, string> = {
        'input': 'Individual Input',
        'review': 'Team Review',
        'finalize': 'Creating Consensus',
        'completed': 'Session Complete',
      };
      const phaseName = phaseNames[data.session.status] || data.session.status;
      toast.success(`Advanced to ${phaseName}`, {
        icon: '🎯',
        duration: 4000,
      });
    }

    // New statement submitted
    if (data.individual_statements.length > prev.individual_statements.length) {
      const submittedCount = data.participants.filter(p => p.has_submitted).length;
      const totalCount = data.participants.filter(p => !p.is_facilitator).length;
      const progress = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

      toast.info(`New statement submitted (${progress}% complete)`, {
        icon: '📝',
        duration: 3000,
      });
    }

    // Statement pinned
    const totalPins = data.individual_statements.reduce((sum, s) => sum + (s.pin_count || 0), 0);
    const prevTotalPins = prev.individual_statements.reduce((sum, s) => sum + (s.pin_count || 0), 0);

    if (totalPins > prevTotalPins) {
      toast('Someone pinned a statement', {
        icon: '⭐',
        duration: 2500,
      });
    }

    // Final statement created
    if (data.final_statement && !prev.final_statement) {
      toast.success('Final statement has been created!', {
        icon: '✨',
        duration: 4000,
      });
    }

    previousDataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!sessionId) {
      setError(new Error('Session ID is required'));
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchData();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`pf_session:${sessionId}`)
      // Session changes (sessions_unified table - renamed from tool_sessions in migration 015)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions_unified',
          filter: `id=eq.${sessionId}`,
        },
        () => {
          fetchData();
        }
      )
      // Participant changes (column renamed from tool_session_id to session_id in migration 015)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_session_participants',
          filter: `session_id=eq.${sessionId}`,
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
          filter: `session_id=eq.${sessionId}`,
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
          filter: `session_id=eq.${sessionId}`,
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
    refresh: (async () => { await fetchData(); }) as () => Promise<void>,
  };
}
