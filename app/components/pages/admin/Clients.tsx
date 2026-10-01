'use client';

import ClientTable from '../../clients/ClientTable';
import DividerBlock from '../../DividerBlock';
import AdminClientCreate from '../../clients/AdminClientCreate';
import SearchBox from '../../forms/SearchBox';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import { clientsLoadAll } from '@/app/actions/clients';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';

export default function Clients() {
  const router = useRouter();
  const toast = useRef<Toast | null>(null);
  const { userProfile } = useAuth();
  const [searchName, setSearchName] = useState('');

  // DATA
  const [clients, setClients] = useState<User[]>([]);

  useEffect(() => {
    if (!userProfile) return;
    const fetchClients = async () => {
      const clientRes = await clientsLoadAll(userProfile.user_role, userProfile.id);
      setClients(clientRes);
    };
    fetchClients();
  }, [userProfile]);

  const refresh = async () => {
    if (!userProfile) return;
    const clientRes = await clientsLoadAll(userProfile.user_role, userProfile.id);
    setClients(clientRes);
    toast.current?.show({
      severity: 'success',
      summary: 'Erfolg',
      detail: 'Der Kunde wurde erfolgreich angelegt.',
    });
  };

  return (
    <div className="page-content" style={{ height: '100%' }}>
      <Toast ref={toast} />
      <div className="row align-center space-between">
        <h1>Kunden</h1>
        <SearchBox
          id="search-desktop"
          maxWidth={480}
          onChange={setSearchName}
          placeholder="Suchen"
          value={searchName}
        />
        <AdminClientCreate onCreate={refresh} />
      </div>
      <DividerBlock height={2} />
      <div className="container" style={{ maxHeight: '100%' }}>
        <ClientTable clients={clients} search={searchName} />
      </div>
    </div>
  );
}
