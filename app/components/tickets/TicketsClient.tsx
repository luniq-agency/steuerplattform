'use client';

import { ticketCreate, ticketEntryCreate, ticketsLoadUser } from '@/app/actions/tickets';
import { useAuth } from '@/app/context/AuthContext';
import { Ticket } from '@/app/types/Database';
import { formatDate } from '@/app/utils/formats';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import DividerBlock from '@/app/components/DividerBlock';
import { Dialog } from 'primereact/dialog';
import { SelectLabel, TextAreaLabel, TextInputLabel } from '@/app/components/forms/FormElements';
import { ticket_options, ticket_status } from '@/app/constants/Constants';
import { useRouter } from 'next/navigation';
import { Tag } from 'primereact/tag';
import { Sidebar } from 'primereact/sidebar';
import Link from 'next/link';

interface Props {
  onSubmit?: () => void;
}

export default function TicketsClient({ onSubmit }: Props) {
  const { userProfile } = useAuth();
  const router = useRouter();

  //DIALOG & SIDEBAR
  const [ticketInspect, setTicketInspect] = useState(false);
  const [visible, setVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  //INPUTS
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketName, setTicketName] = useState('');

  useEffect(() => {
    if (!userProfile) return;

    const fetchDocs = async () => {
      try {
        const res = await ticketsLoadUser(userProfile.id);
        setTickets(res);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDocs();
  }, [userProfile]);

  const refreshTickets = async () => {
    if (!userProfile) return;
    const res = await ticketsLoadUser(userProfile.id);
    setTickets(res);
  };

  const selectTicket = async (rowData: Ticket) => {
    router.push(`/dashboard/tickets/${rowData.id}`);
  };

  const submitTicket = async () => {
    setSubmitting(true);

    const payload = {
      category: ticketCategory,
      created_at: new Date(),
      created_by: userProfile?.id,
      description: ticketDescription,
      name: ticketName,
      status: 'new',
    };

    try {
      const res = await ticketCreate(payload);

      const entryPayload = {
        created_at: new Date(),
        created_by: userProfile?.id,
        content: ticketDescription,
        ticket: res.id,
      };
      await ticketEntryCreate(entryPayload);
      setVisible(false);
      await refreshTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
      setTicketCategory('');
      setTicketDescription('');
      setTicketName('');
      router.refresh();
    }
  };

  const statusTemplate = (rowData: Ticket) => {
    const statusObj = ticket_status.find((t) => t.value === rowData.status);
    return <Tag severity={(statusObj?.severity as any) ?? 'info'} value={statusObj?.label ?? ''} />;
  };

  return (
    <>
      <Dialog
        draggable={false}
        header="Neues Ticket"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <SelectLabel
            label="Kategorie"
            onChange={setTicketCategory}
            optionLabel="label"
            optionValue="value"
            options={ticket_options}
            value={ticketCategory}
          />
          <TextInputLabel label="Name des Tickets" onChange={setTicketName} value={ticketName} />
          <TextAreaLabel
            label="Beschreibe dein Problem"
            onChange={setTicketDescription}
            value={ticketDescription}
          />

          <Button
            disabled={!ticketName || !ticketCategory || !ticketDescription || submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Ticket erstellen"
            onClick={submitTicket}
          />
        </div>
      </Dialog>
      <div className="row space-between">
        <h1>Meine Tickets</h1>
        <Link href="/dashboard/ticket-erstellen">
          <Button
            className="button-primary"
            icon="pi pi-plus"
            label="Ticket erstellen"
          />
        </Link>
      </div>
      <DividerBlock height={2} />
      <DataTable
        emptyMessage="Du hast noch keine Tickets erstellt."
        paginator
        onRowClick={(e) => selectTicket(e.data as Ticket)}
        rows={10}
        stripedRows
        value={tickets}
      >
        <Column field="name" header="Name" />
        <Column body={(rowData) => formatDate(rowData.created_at)} header="Erstellt am" />
        <Column body={statusTemplate} header="Status" />
      </DataTable>
    </>
  );
}
