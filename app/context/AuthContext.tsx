'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { signOut } from '../actions/auth';
import type { Client, User as UserProfile } from '../types/Database';
import { Team } from '../types/teams';

interface AuthContextType {
  clientProfile: Client | null;
  initialLoading: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchTeam: (teamId: string) => Promise<{ error?: string }>;
  team: Team | null;
  user: User | null;
  userProfile: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({
  clientProfile: null,
  initialLoading: true,
  loading: true,
  logout: async () => { },
  refreshProfile: async () => { },
  switchTeam: async () => ({}),
  team: null,
  user: null,
  userProfile: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user')
      .select('*, team:team_aktiv(*)')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) console.error('Profil konnte nicht geladen werden:', error);

    if (data) {
      const { team, ...profile } = data;
      setUserProfile(profile as UserProfile);
      setTeam((team as Team) ?? null);
    } else {
      setUserProfile(null);
      setTeam(null);
    }
  }, [supabase]);

  const clearState = () => {
    setUserProfile(null);
    setTeam(null);
    setClientProfile(null);
  };

  useEffect(() => {
    // Feuert sofort mit INITIAL_SESSION, ein separates getSession() ist nicht nötig
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);

      // Supabase-Abfragen nicht direkt im Callback ausführen (kann sonst hängen bleiben)
      setTimeout(async () => {
        if (session?.user) await fetchProfile(session.user.id);
        else clearState();
        setLoading(false);
        setInitialLoading(false);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const switchTeam = async (teamId: string) => {
    if (!user) return { error: 'Nicht angemeldet' };

    const { error } = await supabase
      .from('user')
      .update({ team_aktiv: teamId })
      .eq('user_id', user.id);

    if (error) return { error: error.message };

    await fetchProfile(user.id);
    return {};
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    clearState();
    window.location.assign('/');
  };

  return (
    <AuthContext.Provider
      value={{ clientProfile, initialLoading, loading, logout, refreshProfile, switchTeam, team, user, userProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);