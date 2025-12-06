'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { SessionListItem, SessionFilters } from '@/types';

export function useSessions(userId: string | null, filters: SessionFilters) {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setSessions([]);
      return;
    }

    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams({
        userId,
        toolType: filters.toolType,
        status: filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
      });

      const response = await fetch(`/api/sessions?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const data = await response.json();

      setSessions(data.sessions || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [userId, filters]);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`user_sessions:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions_unified',
          filter: `created_by=eq.${userId}`,
        },
        (payload) => {
          console.log('Session change detected:', payload);
          fetchSessions(); // Refetch with current filters
        }
      )
      .subscribe((status) => {
        console.log('Sessions subscription status:', status);
      });

    // Fallback polling every 30 seconds
    const pollInterval = setInterval(() => {
      fetchSessions();
    }, 30000);

    return () => {
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [userId, fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
}
