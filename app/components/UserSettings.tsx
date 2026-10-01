'use client';

import { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { useAuth } from '../context/AuthContext';
import { TextInputLabel } from './forms/FormElements';
import { UserAvatar } from './UserAvatar';
import { Divider } from 'primereact/divider';

export default function UserSettings() {
  const { user, userProfile } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <TabView>
      <TabPanel header="Profil">
        <div className="column gap-m">
          <UserAvatar fontSize={24} height={64} width={64} />
          <Divider />
          <div className="grid columns-two gap-m mobile-column">
            <TextInputLabel label="E-Mail" />
          </div>
        </div>
      </TabPanel>
    </TabView>
  );
}
