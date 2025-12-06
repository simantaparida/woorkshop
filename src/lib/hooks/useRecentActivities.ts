'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ActivityEntry } from '@/types';

export function useRecentActivities(userId: string | null, limit: number = 10) {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setActivities([]);
      return;
    }

    let isSubscribed = true;

    async function fetchActivities() {
      try {
        const response = await fetch(`/api/recent-activities?userId=${userId}&limit=${limit}`);

        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }

        const data = await response.json();

        if (isSubscribed) {
          setActivities(data.activities || []);
          setLoading(false);
          setError(null);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to load activities');
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchActivities();

    // Subscribe to all activity-related tables
    const channel = supabase
      .channel(`activities:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions_unified',
          filter: `created_by=eq.${userId}`,
        },
        () => {
          console.log('Session activity detected (create/complete), refetching...');
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_session_participants',
        },
        () => {
          console.log('Participant join detected, refetching...');
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_attachments',
        },
        () => {
          console.log('Attachment upload detected, refetching...');
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
        },
        () => {
          console.log('Player activity detected, refetching...');
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_individual_statements',
        },
        () => {
          console.log('Statement activity detected, refetching...');
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_statement_pins',
        },
        () => {
          console.log('Pin activity detected, refetching...');
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
        },
        () => {
          console.log('Vote activity detected, refetching...');
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pf_final_statement',
        },
        () => {
          console.log('Finalization activity detected, refetching...');
          fetchActivities();
        }
      )
      .subscribe((status) => {
        console.log('Activities subscription status:', status);
      });

    // Polling fallback every 5 seconds (less frequent than sessions)
    const pollInterval = setInterval(() => {
      fetchActivities();
    }, 5000);

    return () => {
      isSubscribed = false;
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [userId, limit]);

  return { activities, loading, error };
}
