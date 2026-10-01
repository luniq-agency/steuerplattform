'use client';

import { Document, Ticket, TicketEntry, User } from '@/app/types/Database';
import styles from '../admin/Admin.module.css';
import { useEffect, useRef, useState } from 'react';
import { ticketEntriesLoadTicket, ticketEntryCreate } from '@/app/actions/tickets';
import { Button } from 'primereact/button';
import TicketUpdateBox from './TicketUpdateBox';
import { InputText } from 'primereact/inputtext';
import { useAuth } from '@/app/context/AuthContext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { usersLoadAll } from '@/app/actions/users';
import { IconButton } from '../buttons/IconButton';
import { Send } from 'lucide-react';
import { documentsLoadUser } from '@/app/actions/documents';

interface Props {
  ticket: Ticket;
}

export default function TicketPageClient({ ticket }: Props) {
  const op = useRef<OverlayPanel | null>(null);
  const { userProfile } = useAuth();

  // DATA
  const [docs, setDocs] = useState<Document[]>([]);
  const [entries, setEntries] = useState<TicketEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // INPUTS
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!ticket || !userProfile) return;

    const fetchEntries = async () => {
      const [res, docRes, userRes] = await Promise.all([
        ticketEntriesLoadTicket(ticket.id),
        documentsLoadUser(userProfile.id),
        usersLoadAll(),
      ]);
      setDocs(docRes);
      setEntries(res);
      setUsers(userRes);
    };
    fetchEntries();
  }, [ticket]);

  // ACTIONS
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitAnswer();
  };

  const submitAnswer = async () => {
    if (!ticket || !userProfile) return;

    const payload = {
      created_at: new Date(),
      created_by: userProfile.id,
      content: message,
      ticket: ticket.id,
    };

    try {
      await ticketEntryCreate(payload);
      setMessage('');
      const res = await ticketEntriesLoadTicket(ticket.id);
      setEntries(res ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!users) return;

  return (
    <div className={styles.chatContainer} style={{ flexGrow: 1 }}>
      <div className={styles.chatContainerHeader}>
        <div className="row">
          <h3>{ticket?.name}</h3>
        </div>
      </div>
      <div className={styles.chatContent}>
        {entries.map((entry) => (
          <TicketUpdateBox creator={entry.created_by} docs={docs} key={entry.id} entry={entry} users={users} />
        ))}
      </div>
      <form className={styles.chatContainerFooter} onSubmit={handleSubmit}>
        <InputText onChange={(e) => setMessage(e.target.value)} value={message} />
        <IconButton disabled={!message} icon={Send} round />
      </form>
    </div>
  );
}
