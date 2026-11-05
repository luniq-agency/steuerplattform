'use client';

import { SecondaryButton } from '@/app/components/buttons/Buttons';
import { TextAreaLabel, TextInputLabel } from '@/app/components/forms/FormElements';
import { SelectLabel } from '@/app/components/inputs/Select';
import { ticket_options } from '@/app/constants/Constants';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import DocumentExplorer from '@/app/components/documents/DocumentExplorer';
import { documentCreate, documentsLoadUser } from '@/app/actions/documents';
import { User } from '@/app/types/Database';
import { foldersLoadUser } from '@/app/actions/folders';
import Row from '@/app/components/layout/Row';
import { useRouter } from 'next/navigation';
import { putBenachrichtigung } from '@/app/actions/notification';
import DividerBlock from '@/app/components/DividerBlock';
import Button from '@/app/components/buttons/Button';
import { Dokument, DokumentOrdner } from '@/app/types/docs';
import { putVorgang, putVorgangUpdate } from '@/app/actions/vorgang/vorgang';
import DashboardContainer from '@/app/components/layout/DashboardContainer';
import Grid from '@/app/components/layout/Grid';
import { fetchClientsForAgent } from '@/app/actions/agency/mandanten';
import DocumentUploader from '@/app/components/documents/DocumentUploader';
import { uploadFileDirectly } from '@/app/actions/media/uploads';
import { sanitizeFileName } from '@/app/utils/sanitize';
import { UserSelectLabel } from '@/app/components/inputs/select/UserSelectLabel';
import { DatePicker } from '@/app/components/forms/datepicker/DatePicker';

type LokaleDatei = { id: string; file: File; name: string };

export default function AgenturVorgangNeu() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  // DATA
  const [documents, setDocuments] = useState<Dokument[]>([]);
  const [folders, setFolders] = useState<DokumentOrdner[]>([]);
  const [mandanten, setMandanten] = useState<User[]>([]);

  // STATES
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  // INPUTS
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [lokaleDateien, setLokaleDateien] = useState<LokaleDatei[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Dokument[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [ticketName, setTicketName] = useState('');

  // Dokumente gehören dem gewählten Mandanten, ohne Auswahl dem Agenturmitarbeiter
  const dokumentBesitzer = selectedUser?.id ?? userProfile?.id;

  // INIT: Mandanten laden
  useEffect(() => {
    if (!userProfile) return;
    fetchClientsForAgent(userProfile.id).then(setMandanten);
  }, [userProfile]);

  // Dokumente und Ordner des aktuellen Besitzers laden
  useEffect(() => {
    if (!dokumentBesitzer) return;
    const fetchData = async () => {
      const [docRes, folderRes] = await Promise.all([
        documentsLoadUser(dokumentBesitzer),
        foldersLoadUser(dokumentBesitzer),
      ]);
      setDocuments(docRes);
      setFolders(folderRes);
    };
    fetchData();
    setSelectedDocs([]); // Auswahl gehört zum vorherigen Mandanten
  }, [dokumentBesitzer]);

  // CHECKS
  const isValid = !!(ticketName && ticketCategory && ticketDescription && selectedUser);

  // ACTIONS
  const refreshDocs = async () => {
    if (!dokumentBesitzer) return;
    setDocuments(await documentsLoadUser(dokumentBesitzer));
  };

  const selectDocument = (doc: Dokument) => {
    setSelectedDocs((prev) => (prev.some((d) => d.id === doc.id) ? prev : [...prev, doc]));
    setVisible(false);
  };

  const removeDocument = (id: number | string) => {
    setSelectedDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const addLokaleDatei = (file: File, name: string) => {
    setLokaleDateien((prev) => [...prev, { id: crypto.randomUUID(), file, name }]);
  };

  const removeLokaleDatei = (id: string) => {
    setLokaleDateien((prev) => prev.filter((d) => d.id !== id));
  };

  const submitTicket = async () => {
    if (!userProfile || !selectedUser) return;
    setSubmitting(true);

    try {
      // 1. Lokale Dateien hochladen und als Dokumente des Mandanten anlegen
      const neueIds: number[] = [];
      for (const d of lokaleDateien) {
        const pfad = `${selectedUser.id}/${Date.now()}-${sanitizeFileName(d.file.name)}`;
        const url = await uploadFileDirectly(d.file, pfad);
        const dok = await documentCreate({
          file: url,
          name: d.name,
          ordner: undefined,
          type: d.file.type,
          user: String(selectedUser.id),
        });
        neueIds.push(dok.id);
      }

      const dokumentIds = [...selectedDocs.map((d) => Number(d.id)), ...neueIds];

      // 2. Vorgang anlegen
      const res = await putVorgang({
        bearbeiter: userProfile.id,
        beschreibung: ticketDescription,
        created_by: userProfile.id,
        dokumente: dokumentIds,
        due_date: dueDate || undefined,
        kategorie: ticketCategory,
        last_updated: new Date(),
        opened_advact: false,
        opened_client: false,
        status: 'neu',
        titel: ticketName,
        user: selectedUser.id,
      });
      if (!res?.id) throw new Error('Vorgang konnte nicht angelegt werden');

      // 3. Ein Verlaufseintrag, mit Dokumenten falls vorhanden
      await putVorgangUpdate({
        body: `${userProfile.vorname} ${userProfile.nachname} hat den Vorgang erstellt.`,
        created_by: userProfile.id,
        dokumente: dokumentIds.length ? dokumentIds : null,
        vorgang: res.id,
      });

      // 4. Mandanten benachrichtigen
      await putBenachrichtigung(
        {
          body: `${userProfile.vorname} ${userProfile.nachname} hat den Vorgang „${ticketName}“ für dich erstellt.`,
          gelesen: false,
          user: selectedUser.id,
          ref: String(res.id),
          title: 'Neuer Vorgang',
          type: 'vorgang',
        },
        selectedUser
      );

      router.push('/agentur/vorgaenge');
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Vorgang konnte nicht erstellt werden',
        detail: 'Bitte prüfe deine Eingaben und versuche es erneut.',
      });
      setSubmitting(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Toast ref={toast} />
      <Dialog
        header={selectedUser ? `Dokumente von ${selectedUser.vorname ?? ''} ${selectedUser.nachname ?? ''}` : 'Dokumente auswählen'}
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
          owner={dokumentBesitzer || userProfile?.id}
        />
      </Dialog>

      <Row alignItems="center" justifyContent="space-between">
        <h1>Neuer Vorgang</h1>
        <Button
          disabled={!isValid || submitting}
          label={submitting ? 'Wird erstellt …' : 'Vorgang erstellen'}
          mode="secondary"
          onClick={submitTicket}
          size="small"
          width="fit-content"
        />
      </Row>
      <DividerBlock height={2} />

      <DashboardContainer>
        <h2>Allgemeine Informationen</h2>
        <DividerBlock height={1} />
        <Grid columns={2} gap={16}>
          <TextInputLabel label="Name des Vorgangs" onChange={setTicketName} value={ticketName} />
          <UserSelectLabel label="Mandant" onChange={setSelectedUser} options={mandanten} value={selectedUser} />
          <SelectLabel
            label="Kategorie"
            onChange={setTicketCategory}
            optionLabel="label"
            optionValue="value"
            options={ticket_options}
            value={ticketCategory}
          />
          <DatePicker label="Frist" onChange={setDueDate} value={dueDate} />
          <TextAreaLabel label="Beschreibung" onChange={setTicketDescription} rows={5} value={ticketDescription} />
          <div />
        </Grid>
      </DashboardContainer>
      <DividerBlock height={1} />

      <DashboardContainer>
        <Row alignItems="center" justifyContent="space-between">
          <h2>Dokumente & Anhänge</h2>
          <Row gap={8} width="fit-content">
            <Button
              disabled={!selectedUser}
              icon={Plus}
              label="Vorhandene Dokumente anhängen"
              mode="tertiary"
              onClick={() => setVisible(true)}
              size="small"
              width="fit-content"
            />
            <DocumentUploader
              folder={null}
              onLocalFile={addLokaleDatei}
              onUpload={refreshDocs}
              owner={String(dokumentBesitzer)}
            />
          </Row>
        </Row>
        <DividerBlock height={1} />

        {selectedDocs.length === 0 && lokaleDateien.length === 0 ? (
          <span className="text-meta">
            {selectedUser
              ? 'Noch keine Dokumente angehängt. Neue Dateien werden beim Erstellen des Vorgangs hochgeladen.'
              : 'Wähle zuerst einen Mandanten, um seine Dokumente anzuhängen.'}
          </span>
        ) : (
          <Row gap={8}>
            {selectedDocs.map((d) => (
              <SecondaryButton key={d.id} icon={X} label={d.name} onClick={() => removeDocument(d.id)} size="small" />
            ))}
            {lokaleDateien.map((d) => (
              <SecondaryButton
                key={d.id}
                icon={X}
                label={`${d.name} (neu)`}
                onClick={() => removeLokaleDatei(d.id)}
                size="small"
              />
            ))}
          </Row>
        )}
      </DashboardContainer>
    </div>
  );
}