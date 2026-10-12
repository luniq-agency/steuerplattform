'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  gelesen: boolean;
  type: string;
  created_at: string;
}

interface NotificationContextType {
  notifications: Notification[];
  ungelesenCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  ungelesenCount: 0,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, userProfile } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    if (!userProfile) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('benachrichtigung')
        .select('*')
        .eq('user', userProfile.id)
        .order('created_at', { ascending: false });
      setNotifications(data ?? []);
    };

    fetchNotifications();

    const channel = supabase
      .channel('benachrichtigung')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'benachrichtigung',
          filter: `user=eq.${userProfile.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile]);

  const markAsRead = async (id: string) => {
    await supabase.from('benachrichtigung').update({ gelesen: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, gelesen: true } : n)));
  };

  const markAllAsRead = async () => {
    if (!userProfile) return;
    await supabase.from('benachrichtigung').update({ gelesen: true }).eq('recipient', userProfile.id); // ← konsistent mit den anderen Queries
    setNotifications((prev) => prev.map((n) => ({ ...n, gelesen: true })));
  };

  const ungelesenCount = notifications.filter((n) => !n.gelesen).length;

  return (
    <NotificationContext.Provider value={{ notifications, ungelesenCount, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
