'use client';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { signOut } from '../actions/auth';
import { Client } from '../types/Database';
import type { User as UserProfile } from '../types/Database';

interface AuthContextType {
  clientProfile: Client | null;
  initialLoading: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  user: User | null;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({
  clientProfile: null,
  user: null,
  userProfile: null,
  initialLoading: true,
  loading: true,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase.from('user').select('*').eq('user_uuid', userId).single();
    setUserProfile(data);
  };

  useEffect(() => {
    // Aktuelle Session laden
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setInitialLoading(false);
      setLoading(false);
    });

    // Session-Änderungen beobachten
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setUserProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const logout = async () => {
    const supabase = createClient(); // Browser Client
    await supabase.auth.signOut(); // Browser Session löschen
    await signOut(); // Server Session löschen + redirect
  };

  return (
    <AuthContext.Provider
      value={{ clientProfile, initialLoading, user, userProfile, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
