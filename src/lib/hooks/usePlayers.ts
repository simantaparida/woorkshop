'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Player, PlayerProgress } from '@/types';

export function usePlayers(sessionId: string | null) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let isSubscribed = true;

    async function fetchPlayers() {
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('session_id', sessionId)
          .order('joined_at', { ascending: true });

        if (error) throw error;

        if (isSubscribed) {
          setPlayers(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to load players');
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchPlayers();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`players:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'players',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Player joined:', payload.new);
          setPlayers((current) => {
            // Prevent duplicates
            if (current.some(p => p.id === (payload.new as Player).id)) {
              return current;
            }
            return [...current, payload.new as Player];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'players',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Player left:', payload.old);
          setPlayers((current) => current.filter((p) => p.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Player updated:', payload.new);
          setPlayers((current) =>
            current.map((p) => (p.id === (payload.new as Player).id ? (payload.new as Player) : p))
          );
        }
      )
      .subscribe((status) => {
        console.log('Players realtime subscription status:', status);
      });

    // Fallback: Poll for updates every 2 seconds as backup if realtime doesn't work
    const pollInterval = setInterval(() => {
      fetchPlayers();
    }, 2000);

    return () => {
      isSubscribed = false;
      channel.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [sessionId]);

  return { players, loading, error };
}

export function usePlayerProgress(sessionId: string | null): {
  progress: PlayerProgress[];
  loading: boolean;
} {
  const { players } = usePlayers(sessionId);
  const [progress, setProgress] = useState<PlayerProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId || players.length === 0) {
      setLoading(false);
      return;
    }

    async function fetchProgress() {
      try {
        const { data: votes, error } = await supabase
          .from('votes')
          .select('player_id, points_allocated')
          .eq('session_id', sessionId);

        if (error) throw error;

        const votesByPlayer = votes?.reduce((acc, vote) => {
          if (!acc[vote.player_id]) {
            acc[vote.player_id] = 0;
          }
          acc[vote.player_id] += vote.points_allocated;
          return acc;
        }, {} as Record<string, number>) || {};

        const progressData = players.map((player) => ({
          player,
          has_voted: player.id in votesByPlayer,
          total_allocated: votesByPlayer[player.id] || 0,
        }));

        setProgress(progressData);
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();

    // Subscribe to vote changes
    const channel = supabase
      .channel(`votes:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [sessionId, players]);

  return { progress, loading };
}
