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
import { putBenachrichtigung } from '@/app/actions/notification';
import { userLookup } from '@/app/actions/users';
import DividerBlock from '@/app/components/DividerBlock';
import Button from '@/app/components/buttons/Button';
import { Dokument, DokumentOrdner } from '@/app/types/docs';
import { putVorgang, putVorgangUpdate } from '@/app/actions/vorgang/vorgang';
import DashboardContainer from '@/app/components/layout/DashboardContainer';
import Grid from '@/app/components/layout/Grid';

export default function VorgangNeu() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // DATA
  const [documents, setDocuments] = useState<Dokument[]>([]);
  const [folders, setFolders] = useState<DokumentOrdner[]>([]);

  // STATES
  const [visible, setVisible] = useState(false);

  // INPUTS
  const [selectedDocs, setSelectedDocs] = useState<Dokument[]>([]);
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

  const selectDocument = (doc: Dokument) => {
    setSelectedDocs((prev) => {
      if (prev.some((d) => d.id === doc.id)) return prev;
      return [...prev, doc];
    });
    setVisible(false);
  };

  const submitTicket = async () => {
    const bearbeiter = userProfile?.bearbeiter ? userProfile.bearbeiter : 2;
    const assignee = await userLookup(bearbeiter);

    if (!assignee) return;

    // VORGANG
    const payload = {
      bearbeiter: assignee.id,
      beschreibung: ticketDescription,
      created_by: userProfile?.id,
      dokumente: selectedDocs.map((d) => d.id),
      kategorie: ticketCategory,
      status: 'neu',
      titel: ticketName,
    };
    const res = await putVorgang(payload);

    // TICKET ENTRY
    if (!selectedDocs) await putVorgangUpdate({
      body: `${userProfile?.vorname} ${userProfile?.nachname} hat den Vorgang erstellt.`,
      created_by: userProfile?.id,
      vorgang: res.id,
    });

    // TICKETS MIT MEDIEN
    selectedDocs &&
      selectedDocs.map(async (d) => {
        await putVorgangUpdate({
          body: `${userProfile?.vorname} ${userProfile?.nachname} hat den Vorgang erstellt.`,
          created_by: userProfile?.id,
          dokumente: selectedDocs.map((d) => d.id),
          vorgang: res.id,
        });
      });

    // BENACHRICHTIGUNG
    const notificationPayload = {
      message: `${userProfile?.vorname} ${userProfile?.nachname} hat das Ticket ${ticketName} erstellt.`,
      read: false,
      recipient: assignee.id,
      ref: String(res.id),
      title: 'Neues Ticket erstellt',
      type: 'vorgang',
    };
    await putBenachrichtigung(notificationPayload, assignee);
    router.push('/dashboard/vorgaenge');
  };

  if (!userProfile) return;

  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
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
      <Row alignItems="center" justifyContent='space-between'>
        <h1>Neuer Vorgang</h1>
        <Button disabled={!isValid} label="Vorgang erstellen" mode="secondary" onClick={submitTicket} size="small" width="fit-content" />
      </Row>
      <DividerBlock height={2} />
      <DashboardContainer>
        <h2>Allgemeine Informationen</h2>
        <DividerBlock height={1} />
        <Grid columns={2} gap={16}>
          <TextInputLabel label="Name des Tickets" onChange={setTicketName} value={ticketName} />
          <SelectLabel label="Kategorie" onChange={setTicketCategory} optionLabel='label' optionValue="value" options={ticket_options} value={ticketCategory} />
          <TextAreaLabel
            label="Beschreibe dein Anliegen"
            onChange={setTicketDescription}
            rows={5}
            value={ticketDescription}
          />
          <div />
        </Grid>
      </DashboardContainer>
      <DividerBlock height={1} />
      <DashboardContainer>
        <Row alignItems='center' justifyContent='space-between'>
          <h2>Dokumente & Anhänge</h2>
          <Button icon={Plus} label="Dokument(e) anhängen" mode="tertiary" onClick={() => setVisible(true)} size='small' width="fit-content" />
        </Row>
        <DividerBlock height={1} />
        {selectedDocs.length >= 1 && (
          <Row gap={8}>
            {selectedDocs.map((d) => (
              <SecondaryButton
                key={d.id}
                icon={X}
                label={d.name}
                onClick={() => removeDocument(d.id)}
                size="small"
              />
            ))}
          </Row>
        )}
      </DashboardContainer>

    </div>
  );
}
