'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '../admin/Admin.module.css';
import { DataScroller } from 'primereact/datascroller';
import { Document, Ticket, TicketEntry, User } from '@/app/types/Database';
import TicketBox from './TicketBox';
import { InputText } from 'primereact/inputtext';
import DividerBlock from '../DividerBlock';
import { ticketEntriesLoadTicket, ticketEntryCreate } from '@/app/actions/tickets';
import { Button } from 'primereact/button';
import TicketUpdateBox from './TicketUpdateBox';
import { useAuth } from '@/app/context/AuthContext';
import { OverlayPanel } from 'primereact/overlaypanel';
import { notificationCreate } from '@/app/actions/notification';
import { userLookup } from '@/app/actions/users';
import { UserAvatar } from '../UserAvatar';
import { formatDate } from '@/app/utils/formats';
import { documentsLoadUser } from '@/app/actions/documents';

interface Props {
  tickets: Ticket[];
  users: User[];
}

export default function TicketsAdmin({ tickets, users }: Props) {
  const { user, userProfile } = useAuth();

  const op = useRef<OverlayPanel | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // DATA
  const [docs, setDocs] = useState<Document[]>([]);

  // STATES
  const [ticketCreator, setTicketCreator] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState(false);

  // TICKET & ENTRIES
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [entries, setEntries] = useState<TicketEntry[]>([]);

  //SUCHFUNKTION
  const [search, setSearch] = useState('');
  const filtered = tickets.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()));

  //CHAT
  const [message, setMessage] = useState('');

  //LOAD ENTRIES
  useEffect(() => {
    if (!selectedTicket) return;

    const fetchEntries = async () => {
      const [res, clientRes, docRes] = await Promise.all([
        ticketEntriesLoadTicket(selectedTicket.id),
        userLookup(selectedTicket.created_by),
        documentsLoadUser(selectedTicket.created_by)
      ]);
      setEntries(res ?? []);
      setTicketCreator(clientRes);
      setDocs(docRes);
    };
    fetchEntries();
  }, [selectedTicket]);

  //SCROLL TO BOTTOM
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !userProfile) return;

    const client = await userLookup(selectedTicket.created_by);

    const payload = {
      created_at: new Date(),
      created_by: userProfile.id,
      content: message,
      ticket: selectedTicket.id,
    };

    const notificationPayload = {
      message: `${userProfile.user_name_first} ${userProfile.user_name_last} hat dein Ticket ${selectedTicket.name} aktualisiert.`,
      read: false,
      recipient: client.id,
      ref: selectedTicket.id,
      type: 'ticket',
    };

    try {
      await ticketEntryCreate(payload);
      await notificationCreate(notificationPayload, client);
      setMessage('');
      const res = await ticketEntriesLoadTicket(selectedTicket.id);
      setEntries(res ?? []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="row width-100">
      <OverlayPanel ref={op}>
        <div className="column">
          <Button
            className="button-context"
            label="Kundendetails"
            onClick={() => {
              op.current?.hide();
              setUserDetails(true);
            }}
          />
          <Button className="button-context" label="Ticket übertragen" />
          <Button className="button-context" label="Ticket schließen" />
        </div>
      </OverlayPanel>
      <div className={styles.adminContainer}>
        <h3>Tickets</h3>
        <DividerBlock height={1} />
        <div className="row gap-s">
          <InputText
            disabled={tickets.length === 0}
            placeholder="Suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/*<Button
            className="button-square button-bordered"
            disabled={tickets.length === 0}
            icon="pi pi-filter"
          />
          */}
        </div>
        <DividerBlock height={1} />
        <DataScroller
          buffer={0.4}
          emptyMessage="Keine Tickets gefunden"
          itemTemplate={(item) => (
            <TicketBox
              onClick={() => setSelectedTicket(item)}
              selected={item === selectedTicket}
              ticket={item}
            />
          )}
          rows={10}
          value={filtered}
        />
      </div>
      {selectedTicket && (
        <div className={styles.chatContainer}>
          <div className={styles.chatContainerHeader}>
            <div className="row space-between">
              <h3>{selectedTicket?.name}</h3>
              <Button
                className="button-square button-bordered"
                icon="pi pi-ellipsis-v"
                onClick={(e) => op.current?.toggle(e)}
              />
            </div>
          </div>
          <div className={styles.chatContent}>
            {entries.map((entry) => (
              <TicketUpdateBox
                creator={entry.created_by}
                docs={docs}
                key={entry.id}
                entry={entry}
                users={users}
              />
            ))}
          </div>
          <form className={styles.chatContainerFooter} onSubmit={submitAnswer}>
            <InputText onChange={(e) => setMessage(e.target.value)} value={message} />
            <Button
              className="button-round"
              disabled={!message}
              icon="pi pi-send"
              onClick={submitAnswer}
              style={{ aspectRatio: 1, height: '100%' }}
              text
            />
          </form>
        </div>
      )}
      {userDetails && ticketCreator && (
        <div
          className={styles.chatContainerHeader}
          style={{
            borderLeft: '1px solid var(--border-color)',
            fontSize: 14,
            maxWidth: 400,
            transition: 'all 0.3s ease-out',
            width: '100%',
          }}
        >
          <div className="row align-center gap-s">
            <UserAvatar fontSize={16} height={32} user={ticketCreator} width={32} />
            <span style={{ flexGrow: 1, fontSize: 16, fontWeight: 700 }}>
              {ticketCreator?.user_name_last}, {ticketCreator?.user_name_first}
            </span>
            <Button
              className="button-square button-bordered"
              icon="pi pi-chevron-right"
              onClick={() => setUserDetails(false)}
            />
          </div>
          <DividerBlock height={2} />
          <div className="column">
            <span>
              <strong>Mitglied seit</strong>
            </span>
            <span>{formatDate(ticketCreator?.created_at)}</span>
          </div>
          <DividerBlock height={1} />
          <div className="column">
            <span>
              <strong>Beruf </strong>
            </span>
            <span>{ticketCreator.job || '–'}</span>
          </div>
        </div>
      )}
    </div>
  );
}
