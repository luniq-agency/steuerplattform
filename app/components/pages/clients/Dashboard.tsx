'use client';

import { createClient } from '@/app/utils/supabase/client';
import DividerBlock from '@/app/components/DividerBlock';
import LinkBlock from '@/app/components/cards/LinkBlock';
import { useAuth } from '@/app/context/AuthContext';
import Loader from '@/app/components/Loader';
import { useEffect, useRef } from 'react';

export default function Dashboard() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (userProfile) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    if (!user) return;

    intervalRef.current = setInterval(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('user').select('*').eq('user_uuid', user.id).single();

      if (data) {
        clearInterval(intervalRef.current!);
        window.location.reload(); // Profil gefunden → neu laden
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, userProfile]);

  if (!user || !userProfile) return <Loader text="Dein Profil wird eingerichtet" />;

  return (
    <div className="content-wrapper" style={{ padding: 16 }}>
      <div className="row gap-m">
        <h1>Hallo, {userProfile?.user_name_first}!</h1>
      </div>
      <DividerBlock height={2} />
      <div className="grid columns-two gap-s">
        <LinkBlock
          background="var(--primary)"
          body="Verwalte deine Dokumente"
          headline="Meine Dokumente"
          target="/dashboard/dokumente"
          textColor="white"
        />
        <LinkBlock
          background="var(--secondary)"
          body="Du hast Fragen? Wir sind für dich da"
          headline="Hilfe & Support"
          target="/dashboard/tickets"
          textColor="var(--text-primary)"
        />
      </div>
    </div>
  );
}
