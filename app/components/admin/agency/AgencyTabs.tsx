'use client';

import { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import ClientTable from '@/app/components/clients/ClientTable';
import { Client, User } from '@/app/types/Database';
import AgencyEditor from '../../agency/AgencyEditor';
import { clientsLoadAgency } from '@/app/actions/clients';
import { formatDate } from '@/app/utils/formats';

interface Props {
  agent: User;
}

export default function AgencyTabs({ agent }: Props) {
  const [mounted, setMounted] = useState(false);

  // DATA
  const [clients, setClients] = useState<User[]>([]);

  // INIT
  useEffect(() => {
    if (!agent) return;

    const fetchClients = async () => {
      const res = await clientsLoadAgency(agent.id);
      setClients(res);
    };
    fetchClients();
    setMounted(true);
  }, [agent]);

  if (!mounted) return null;

  return (
    <TabView>
      <TabPanel header="Kunden">
        <ClientTable bearbeiter={agent} clients={clients} />
      </TabPanel>
      <TabPanel header="Profil">
        <AgencyEditor user={agent} />
      </TabPanel>
      <TabPanel header="Statistiken">
        <div className="grid columns-four gap-m">
          <div className="column">
            <h4>Kunden</h4>
            <span>{clients.length}</span>
          </div>
          <div className="column">
            <h4>Registriert seit</h4>
            <span>{formatDate(agent.created_at)}</span>
          </div>
        </div>
      </TabPanel>
    </TabView>
  );
}
