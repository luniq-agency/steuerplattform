'use client';

import { SecondaryButton, TertiaryButton } from '@/app/components/buttons/Buttons';
import { TextAreaLabel, TextInputLabel } from '@/app/components/forms/FormElements';
import { SelectLabel } from '@/app/components/inputs/Select';
import Column from '@/app/components/layout/Column';
import { ticketCreate, ticketEntryCreate } from '@/app/actions/tickets';
import { ticket_options } from '@/app/constants/Constants';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useState } from 'react';
import { Files, Plus, X } from 'lucide-react';
import { Dialog } from 'primereact/dialog';
import DocumentExplorer from '@/app/components/documents/DocumentExplorer';
import { documentsLoadUser } from '@/app/actions/documents';
import { Document, DocumentFolder } from '@/app/types/Database';
import { foldersLoadUser } from '@/app/actions/folders';
import Row from '@/app/components/layout/Row';
import { IconButton } from '@/app/components/buttons/IconButton';
import { useRouter } from 'next/navigation';
import { notificationCreate } from '@/app/actions/notification';
import { userLookup } from '@/app/actions/users';

export default function PageTicketErstellen() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // DATA
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);

  // STATES
  const [visible, setVisible] = useState(false);

  // INPUTS
  const [selectedDocs, setSelectedDocs] = useState<Document[]>([]);
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketName, setTicketName] = useState('');

  // INIT
  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      const res = await documentsLoadUser(userProfile.id);
      const folderRes = await foldersLoadUser(userProfile.id);
      setDocuments(res);
      setFolders(folderRes);
    };
    fetchData();
  }, [userProfile]);

  // CHECKS
  const isValid = ticketName && ticketCategory && ticketDescription;

  // ACTIONS
  const refreshDocs = async () => {
    if (!userProfile) return;
    const res = await documentsLoadUser(userProfile.id);
    setDocuments(res);
  };

  const removeDocument = (id: number | string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const selectDocument = (doc: Document) => {
    setSelectedDocs((prev) => {
      if (prev.some((d) => d.id === doc.id)) return prev;
      return [...prev, doc];
    });
    setVisible(false);
  };

  const submitTicket = async () => {
    const bearbeiter = userProfile?.bearbeiter ? userProfile.bearbeiter : String(119);
    const assignee = await userLookup(bearbeiter);

    if (!assignee) return;

    // TICKET
    const payload = {
      assignee: assignee.id,
      category: ticketCategory,
      created_by: userProfile?.id,
      description: ticketDescription,
      documents: selectedDocs.map((d) => d.id),
      name: ticketName,
      status: 'new',
    };
    const res = await ticketCreate(payload);

    // TICKET ENTRY
    const entryPayload = {
      created_by: userProfile?.id,
      content: `${userProfile?.user_name_first} ${userProfile?.user_name_last} hat das Ticket erstellt.`,
      ticket: res.id,
    };
    await ticketEntryCreate(entryPayload);

    // TICKETS MIT MEDIEN
    selectedDocs &&
      selectedDocs.map(async (d) => {
        const payload = {
          created_by: userProfile?.id,
          media: d.id,
          ticket: res.id,
        };
        await ticketEntryCreate(payload);
      });

    // BENACHRICHTIGUNG
    const notificationPayload = {
      message: `${userProfile?.user_name_first} ${userProfile?.user_name_last} hat das Ticket ${ticketName} erstellt.`,
      read: false,
      recipient: assignee.id,
      ref: res.id,
      title: 'Neues Ticket erstellt',
      type: 'ticket',
    };
    await notificationCreate(notificationPayload, assignee);
    router.push('/dashboard/tickets');
  };

  if (!userProfile) return;

  return (
    <Column maxWidth={600}>
      <Dialog
        header="Dokumente auswählen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 1200, minHeight: '80vh' }}
        visible={visible}
      >
        <DocumentExplorer
          documents={documents}
          folders={folders}
          onDelete={refreshDocs}
          onSelectDoc={selectDocument}
          onSelectFolder={refreshDocs}
          owner={userProfile.id}
        />
      </Dialog>
      <h1>Ticket erstellen</h1>
      <SelectLabel
        label="Kategorie"
        onChange={setTicketCategory}
        optionDescription="description"
        optionLabel="label"
        optionValue="value"
        options={ticket_options}
        value={ticketCategory}
      />
      <TextInputLabel label="Name des Tickets" onChange={setTicketName} value={ticketName} />
      <TextAreaLabel
        label="Beschreibe dein Anliegen"
        onChange={setTicketDescription}
        value={ticketDescription}
      />
      <Column gap={4}>
        <label>Anhänge</label>
        <IconButton icon={Files} onClick={() => setVisible(true)} />
      </Column>
      {selectedDocs.length >= 1 && (
        <Row gap={8}>
          {selectedDocs.map((d) => (
            <SecondaryButton
              key={d.id}
              icon={X}
              label={d.document_name}
              onClick={() => removeDocument(d.id)}
              size="small"
            />
          ))}
        </Row>
      )}
      <TertiaryButton disabled={!isValid} label="Ticket erstellen" onClick={submitTicket} />
    </Column>
  );
}
