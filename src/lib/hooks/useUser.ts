'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isSubscribed = true;

    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isSubscribed) return;

        if (session?.user) {
          const userData = session.user;
          const userName = 
            userData.user_metadata?.full_name || 
            userData.user_metadata?.name || 
            userData.user_metadata?.display_name ||
            userData.email?.split('@')[0] ||
            'User';
          
          // Generate initials
          const initials = userName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
          
          setUser({
            id: userData.id,
            email: userData.email || 'No email',
            name: userName,
            initials,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        if (isSubscribed) {
          setUser(null);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    loadUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isSubscribed) return;

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setLoading(false);
      } else if (session?.user) {
        const userData = session.user;
        const userName = 
          userData.user_metadata?.full_name || 
          userData.user_metadata?.name || 
          userData.user_metadata?.display_name ||
          userData.email?.split('@')[0] ||
          'User';
        
        const initials = userName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'U';
        
        setUser({
          id: userData.id,
          email: userData.email || 'No email',
          name: userName,
          initials,
        });
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
