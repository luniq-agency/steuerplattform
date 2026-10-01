// app/hooks/useProfilePolling.ts
'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { User } from '@supabase/supabase-js';

export function useProfilePolling(user: User | null, userProfile: any) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Nicht pollen wenn kein User eingeloggt
    if (!user) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (userProfile) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('user').select('*').eq('user_uuid', user.id).single();

      if (data) {
        clearInterval(intervalRef.current!);
        window.location.reload();
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, userProfile]);
}
