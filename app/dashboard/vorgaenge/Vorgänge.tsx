'use client';

import { useAuth } from '@/app/context/AuthContext';
import { Ticket } from '@/app/types/Database';
import { formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import DividerBlock from '@/app/components/DividerBlock';
import { ticket_status } from '@/app/constants/Constants';
import { useRouter } from 'next/navigation';
import { Tag } from 'primereact/tag';
import Link from 'next/link';
import Button from '@/app/components/buttons/Button';
import { Plus } from 'lucide-react';
import Row from '@/app/components/layout/Row';
import { fetchVorgaengeByClient } from '@/app/actions/vorgang/vorgang';
import { Vorgang } from '@/app/types/vorgang';

export default function Vorgänge() {
  const { team, userProfile } = useAuth();
  const router = useRouter();

  // DATA
  const [tickets, setTickets] = useState<Vorgang[]>([]);

  const id = String(userProfile?.id);

  useEffect(() => {
    if (!userProfile) return;

    const fetchDocs = async () => {
      try {
        const res = await fetchVorgaengeByClient(id);
        setTickets(res);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDocs();
  }, [userProfile]);

  const refreshTickets = async () => {
    if (!userProfile) return;
    const res = await fetchVorgaengeByClient(id);
    setTickets(res);
  };

  const selectTicket = async (rowData: Vorgang) => {
    router.push(`/dashboard/vorgaenge/${rowData.id}`);
  };

  const statusTemplate = (rowData: Ticket) => {
    const statusObj = ticket_status.find((t) => t.value === rowData.status);
    return <Tag severity={(statusObj?.severity as any) ?? 'info'} value={statusObj?.label ?? ''} />;
  };

  return (
    <>
      <Row alignItems="center" justifyContent='space-between'>
        <h1>Meine Vorgänge</h1>
        <Link href="/dashboard/vorgaenge/neu">
          <Button
            icon={Plus}
            label="Vorgang erstellen"
            mode="secondary"
            size="small"
          />
        </Link>
      </Row>
      <DividerBlock height={2} />
      <DataTable
        emptyMessage="Du hast noch keine Tickets erstellt."
        paginator
        onRowClick={(e) => selectTicket(e.data as Vorgang)}
        rows={10}
        stripedRows
        value={tickets}
      >
        <Column field="titel" header="Name" />
        <Column body={(rowData) => formatDate(rowData.created_at)} header="Erstellt am" />
        <Column body={statusTemplate} header="Status" />
      </DataTable>
    </>
  );
}
