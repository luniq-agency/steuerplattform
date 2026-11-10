'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Timeline } from 'primereact/timeline';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { useRef } from 'react';
import { User } from '@/app/types/Database';
import { Vorgang, Vorgangupdate } from '@/app/types/vorgang';
import { usersLoadAll } from '@/app/actions/users';
import { fetchVorgangUpdates, patchVorgang, putVorgangUpdate } from '@/app/actions/vorgang/vorgang';
import { putBenachrichtigung } from '@/app/actions/notification';
import { useAuth } from '@/app/context/AuthContext';
import { formatDate, formatDateWithTime, toDateString } from '@/app/utils/formats';
import { UserAvatar } from '../../UserAvatar';
import DividerBlock from '../../DividerBlock';
import { DatePicker } from '../../forms/FormElements';
import { PrimaryButton, SecondaryButton } from '../../buttons/Buttons';
import DashboardContainer from '../../layout/DashboardContainer';
import Column from '../../layout/Column';
import Row from '../../layout/Row';
import UserDisplay from '../../users/UserDisplay';
import UserSelector from '../../forms/UserSelector';
import DetailField from '../../forms/DetailField';
import Button from '../../buttons/Button';
import { Dokument } from '@/app/types/docs';
import { fetchDocumentsFromList } from '@/app/actions/documents';
import { Dialog } from 'primereact/dialog';
import DocumentPreviewer from '../../documents/DocumentPreviewer';
import Grid from '../../layout/Grid';

// Status-Werte müssen zu ticket_status in Constants passen
const STATUS_GESCHLOSSEN = 'geschlossen';
const STATUS_WIEDERVORLAGE = 'wiedervorlage';

const updateOptions = [
  { label: 'Aufgabe abgeschlossen', value: 'close' },
  { label: 'Auf Wiedervorlage', value: 'hold' },
  { label: 'Update schreiben', value: 'update' },
];

interface Props {
  task: Vorgang;
}

export default function TaskEditor({ task }: Props) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const toast = useRef<Toast | null>(null);

  // DATA
  const [docs, setDocs] = useState<Dokument[]>([]);
  const [updates, setUpdates] = useState<Vorgangupdate[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // SELECTIONS
  const [selectedDoc, setSelectedDoc] = useState<Dokument | null>(null);

  // STATES
  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  // INPUTS
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [updateTarget, setUpdateTarget] = useState<User | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState('');

  // INIT
  useEffect(() => {
    if (!task) return;
    const load = async () => {
      const [docRes, updateRes, userRes] = await Promise.all([
        fetchDocumentsFromList(task.dokumente ?? []),
        fetchVorgangUpdates(task.id),
        usersLoadAll(),
      ]);
      setDocs(docRes);
      setUpdates(updateRes);
      setUsers(userRes);
    };
    load();
  }, [task.id]);

  // HELPERS
  const findUser = (id: User['id'] | null | undefined) => users.find((u) => u.id === id) ?? null;

  const assignee = findUser(task.bearbeiter);
  const client = findUser(task.user);
  const creator = findUser(task.created_by);
  const geschlossen = task.status === STATUS_GESCHLOSSEN;

  // TEMPLATES
  const customMarker = (item: Vorgangupdate) => (
    <UserAvatar fontSize={16} height={32} user={findUser(item.created_by) || undefined} width={32} />
  );

  const customContent = (item: Vorgangupdate) => {
    const autor = findUser(item.created_by);
    return (
      <Column gap={0}>
        <Row justifyContent="space-between">
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            {autor ? `${autor.vorname} ${autor.nachname}` : 'Unbekannt'}
          </span>
          <span className="text-s" style={{ whiteSpace: 'nowrap' }}>
            {formatDateWithTime(item.created_at)}
          </span>
        </Row>
        <span className="text-s">{item.body}</span>
      </Column>
    );
  };

  // ACTIONS
  const resetForm = () => {
    setDate(undefined);
    setUpdateTarget(null);
    setUpdateText('');
    setUpdateType('');
  };

  const createUpdate = async () => {
    if (!updateType || !userProfile) return;
    setSubmitting(true);

    let body = updateText;
    let vorgangAenderung: Partial<Vorgang> = {};

    switch (updateType) {
      case 'close':
        body = 'Aufgabe wurde abgeschlossen.';
        vorgangAenderung = { status: STATUS_GESCHLOSSEN };
        break;
      case 'transfer':
        if (!updateTarget) return setSubmitting(false);
        body = `Die Aufgabe wurde an ${updateTarget.vorname} ${updateTarget.nachname} übertragen.`;
        vorgangAenderung = { bearbeiter: updateTarget.id };
        break;
      case 'hold':
        if (!date) return setSubmitting(false);
        body = `Aufgabe auf Wiedervorlage zum ${formatDate(date)} gesetzt.`;
        vorgangAenderung = { status: STATUS_WIEDERVORLAGE, due_date: date };
        break;
    }

    try {
      await putVorgangUpdate({ body, created_by: userProfile.id, vorgang: task.id });
      await patchVorgang({ ...vorgangAenderung, last_updated: new Date() }, task.id);

      // Neuen Bearbeiter informieren
      if (updateType === 'transfer' && updateTarget) {
        await putBenachrichtigung(
          {
            body: `${userProfile.vorname} ${userProfile.nachname} hat dir die Aufgabe „${task.titel}“ übertragen.`,
            gelesen: false,
            user: updateTarget.id,
            ref: String(task.id),
            title: 'Aufgabe übertragen',
            type: 'vorgang',
          },
          updateTarget
        );
      }

      setUpdates(await fetchVorgangUpdates(task.id));
      router.refresh();
      resetForm();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Speichern fehlgeschlagen',
        detail: 'Das Update konnte nicht gespeichert werden.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ACTIONS
  const selectDoc = (d: Dokument) => {
    setSelectedDoc(d);
    setVisible(true);
  }

  // CHECKS
  const unvollstaendig =
    (updateType === 'hold' && !date) ||
    (updateType === 'update' && !updateText.trim()) ||
    (updateType === 'transfer' && !updateTarget);

  return (
    <Row className="mobile-column">
      <Toast ref={toast} />
      <Dialog draggable={false} onHide={() => setVisible(false)} style={{ minHeight: 600, maxWidth: 1000 }} visible={visible}>
        {selectedDoc && <DocumentPreviewer doc={selectedDoc} />}
      </Dialog>
      <Row className="mobile-column" gap={16}>
        <DashboardContainer header={task.titel}>
          <DetailField label="Beschreibung" value={task.beschreibung || '–'} />
          <DividerBlock height={1} />
          <Grid columns={2} gap={16}>
            <DetailField label="Erstellt am" value={formatDate(task.created_at)} />
            <DetailField label="Fällig bis" value={task.due_date ? formatDate(task.due_date) : '–'} />
          </Grid>
          <DividerBlock height={1} />
          <label>Dokumente</label>
          <Row gap={8}>
            {docs.map((d: Dokument, i) => <SecondaryButton key={d.id} label={`${d.name}`} onClick={() => selectDoc(d)} size="small"
            />)}
          </Row>
          <DividerBlock height={1} />
          <UserDisplay label="Erstellt von" user={creator} />
          <DividerBlock height={1} />
          <UserDisplay label="Bearbeiter" user={assignee} />
          <DividerBlock height={1} />
          <UserDisplay label="Verknüpfter Kunde" user={client} />
          <DividerBlock height={1} />

          {geschlossen ? (
            <div className="column gap-s">
              <label>Update</label>
              <span>Die Aufgabe wurde abgeschlossen.</span>
            </div>
          ) : (
            <div className="column gap-s">
              <label>Update</label>
              <Dropdown
                onChange={(e) => setUpdateType(e.value)}
                optionLabel="label"
                optionValue="value"
                options={updateOptions}
                value={updateType}
              />
              <DividerBlock height={0.25} />
              {updateType === 'update' && (
                <InputTextarea onChange={(e) => setUpdateText(e.target.value)} rows={5} value={updateText} />
              )}
              {updateType === 'hold' && (
                <DatePicker label="Erinnerung am" minDate={new Date()} onDateChange={setDate} dateValue={date} />
              )}
              <DividerBlock height={0.5} />
              <Button
                disabled={!updateType || submitting || unvollstaendig}
                label={submitting ? 'Wird gespeichert …' : 'Speichern'}
                mode="secondary"
                onClick={createUpdate}
                size='medium'
              />
            </div>
          )}
        </DashboardContainer>
        <DashboardContainer header="Verlauf">
          <Timeline align="left" content={customContent} marker={customMarker} value={updates} />
        </DashboardContainer>
      </Row>
    </Row>
  );
}