'use client';


import { documentsLoadUser } from "@/app/actions/documents";
import { foldersLoadUser } from "@/app/actions/folders";
import { userUpdate } from "@/app/actions/users";
import { fetchVorgaengeByClient } from "@/app/actions/vorgang/vorgang";
import Button from "@/app/components/buttons/Button";
import { ContextButton } from "@/app/components/buttons/Buttons";
import DividerBlock from "@/app/components/DividerBlock";
import DocumentExplorer from "@/app/components/documents/DocumentExplorer";
import DocumentPreviewer from "@/app/components/documents/DocumentPreviewer";
import DocumentUploader from "@/app/components/documents/DocumentUploader";
import DocumentViewer from "@/app/components/documents/DocumentViewer";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { NumberInputLabel, TextAreaLabel, TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import Column from "@/app/components/layout/Column";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import Loader from "@/app/components/loader/Loader";
import { UserAvatarOther } from "@/app/components/UserAvatar";
import { family_options, job_categories } from "@/app/constants/Constants";
import { User } from "@/app/types/Database";
import { Dokument, DokumentOrdner } from "@/app/types/docs";
import { Vorgang } from "@/app/types/vorgang";
import { formatDate, parseDate, toDateString } from "@/app/utils/formats";
import { useRouter } from "next/navigation";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { OverlayPanel } from "primereact/overlaypanel";
import { TabPanel, TabView } from "primereact/tabview";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";

interface Props {
  user: User;
}

export default function Mandant({ user }: Props) {
  const saveRef = useRef<(() => void) | null>(null);
  const router = useRouter();

  // REFS
  const op = useRef<OverlayPanel | null>(null);
  const toast = useRef<Toast | null>(null);

  // DATA
  const [docs, setDocs] = useState<Dokument[]>();
  const [folders, setFolders] = useState<DokumentOrdner[]>([]);
  const [tickets, setTickets] = useState<Vorgang[]>([]);

  // STANDARD
  const [initial, setInitial] = useState(() => ({
    beruf: user.beruf || '',
    berufsstatus: user.berufsstatus || 'employed',
    email: user.email || '',
    familienstand: user.familienstand || 'single',
    geburtsdatum: toDateString(user.geburtsdatum),
    hausnummer: user.hausnummer || '',
    iban: user.iban || '',
    kinder: user.kinder || 0,
    nachname: user.nachname || '',
    notizen: user.notizen || '',
    ort: user.ort || '',
    plz: user.plz || '',
    steuer_id: user.steuer_id || '',
    strasse: user.strasse || '',
    telefon: user.telefon || '',
    vorname: user.vorname || '',
  }));

  // INPUTS
  const [beruf, setBeruf] = useState(initial.beruf);
  const [berufsstatus, setBerufsstatus] = useState(initial.berufsstatus);
  const [email, setEmail] = useState(initial.email);
  const [familienstand, setFamilienstand] = useState(initial.familienstand);
  const [geburtsdatum, setGeburtsdatum] = useState<Date | null>(parseDate(user.geburtsdatum));
  const [hausnummer, setHausnummer] = useState(initial.hausnummer);
  const [iban, setIban] = useState(initial.iban);
  const [kinder, setKinder] = useState(initial.kinder);
  const [nachname, setNachname] = useState(initial.nachname);
  const [notizen, setNotizen] = useState(initial.notizen);
  const [ort, setOrt] = useState(initial.ort);
  const [plz, setPlz] = useState(initial.plz);
  const [steuerId, setSteuerId] = useState(initial.steuer_id);
  const [strasse, setStrasse] = useState(initial.strasse);
  const [telefon, setTelefon] = useState(initial.telefon);
  const [vorname, setVorname] = useState(initial.vorname);

  // SELECTIONS
  const [selectedDoc, setSelectedDoc] = useState<Dokument | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DokumentOrdner | null>(null);

  // STATES
  const [deleting, setDeleting] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [saving, setSaving] = useState(false);

  const current = {
    beruf,
    berufsstatus,
    email,
    familienstand,
    geburtsdatum: toDateString(geburtsdatum),
    hausnummer,
    iban,
    kinder,
    nachname,
    notizen,
    ort,
    plz,
    steuer_id: steuerId,
    strasse,
    telefon,
    vorname,
  };

  // INIT
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [docRes, folderRes, ticketRes] = await Promise.all([
        documentsLoadUser(user.id),
        foldersLoadUser(user.id),
        fetchVorgaengeByClient(user.id),
      ])
      setDocs(docRes);
      setFolders(folderRes);
      setTickets(ticketRes);
    }
    fetchData()
  }, [user])

  // CHECK
  const hasChanges = (Object.keys(initial) as (keyof typeof initial)[]).some(
    (key) => initial[key] !== current[key]
  );

  useEffect(() => {
    if (!hasChanges) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http')) return;

      e.preventDefault();
      if (window.confirm('Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?')) {
        setInitial(current); // Warnung deaktivieren
        router.push(href);
      }
    };

    // Warnung bei Reload, Tab schließen oder externer Navigation
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasChanges, router]);

  const job = job_categories.find((t) => t.value === user.job_status);

  // ACTIONS
  const confirmDelete = async () => {

  }

  const handleSave = async () => {
    setSaving(true);
    const result = await userUpdate(current, user.id);

    if (result?.error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Speichern fehlgeschlagen',
        detail: 'Die Änderungen konnten nicht gespeichert werden.',
      });
    } else {
      setInitial(current); // neuer Ausgangsstand → hasChanges wird false
      toast.current?.show({
        severity: 'success',
        summary: 'Änderungen gespeichert',
        detail: 'Die Änderungen wurden erfolgreich gespeichert.',
      });
    }
    setSaving(false);
  };

  const refresh = async () => {
    const [docRes, folderRes, ticketRes] = await Promise.all([
      documentsLoadUser(user.id),
      foldersLoadUser(user.id),
      fetchVorgaengeByClient(user.id),
    ])
    setDocs(docRes);
    setFolders(folderRes);
    setTickets(ticketRes);
  }

  const selectDoc = (d: Dokument) => {
    setSelectedDoc(d);
    setInspecting(true);
  }

  // DIALOG
  const close = () => { }

  const deleteUser = () => {
    confirmDialog({
      message: 'Bist du sicher, dass du den Mandanten löschen möchtest? Das kann nicht rückgängig gemacht werden!',
      header: 'Mandant löschen',
      icon: '',
      defaultFocus: 'accept',
      accept: confirmDelete,
      reject: close,
    });
  };

  return (
    <div className="page-content column">
      <ConfirmDialog style={{ maxWidth: 400 }} />
      {deleting && <Loader text="Kunde wird gelöscht" />}
      <Toast ref={toast} />
      <Dialog onHide={() => setInspecting(false)} style={{ maxWidth: '90vw', minHeight: '90vh' }} visible={inspecting}>
        {selectedDoc && <DocumentPreviewer doc={selectedDoc} />}
      </Dialog>
      <OverlayPanel ref={op}>
        <ContextButton label="Kunde löschen" onClick={deleteUser} />
      </OverlayPanel>
      <Row alignItems="center">
        <Row alignItems="center" gap={8}>
          <UserAvatarOther
            backgroundColor={job?.bg}
            color={job?.color}
            fontSize={24}
            height={64}
            user={user}
            width={64}
          />
          <Column gap={0}>
            <h1>{user.nachname}, {user.vorname}</h1>
            <span className="text-meta">Angemeldet seit: {formatDate(user.created_at)}</span>
          </Column>
        </Row>
        <Row gap={8} width="fit-content">
          <Button label="Aktionen" mode="tertiary" onClick={(e) => op.current?.toggle(e)} size="small" />
          <Button disabled={!hasChanges} label="Speichern" mode="secondary" onClick={handleSave} size="small" />
        </Row>
      </Row>
      <DividerBlock height={1} />
      <TabView>
        <TabPanel header="Stammdaten">
          <DashboardContainer>
            <h2>Allgemeine Angaben</h2>
            <DividerBlock height={1} />
            <Grid columns={2} gap={16}>
              <TextInputLabel label="Vorname" onChange={setVorname} value={vorname} />
              <TextInputLabel label="Nachname" onChange={setNachname} value={nachname} />
              <DatePicker label="Geburtsdatum" onChange={setGeburtsdatum} value={geburtsdatum} />
            </Grid>
          </DashboardContainer>
          <DividerBlock height={1} />
          <DashboardContainer>
            <h2>Anschrift & Kontakt</h2>
            <DividerBlock height={1} />
            <Grid columns={2} gap={16}>
              <TextInputLabel label="Strasse" onChange={setStrasse} value={strasse} />
              <TextInputLabel label="Hausnummer" onChange={setHausnummer} value={hausnummer} />
              <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
              <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
              <TextInputLabel label="E-Mail" onChange={setEmail} value={email} />
              <TextInputLabel label="Telefon" onChange={setTelefon} value={telefon} />
            </Grid>
          </DashboardContainer>
          <DividerBlock height={1} />
          <DashboardContainer>
            <h2>Steuern & Berufsstatus</h2>
            <DividerBlock height={1} />
            <Grid columns={2} gap={16}>
              <SelectLabel label="Berufsstatus" onChange={setBerufsstatus} optionLabel="label" optionValue="value" options={job_categories} value={berufsstatus} />
              <TextInputLabel label="Beruf" onChange={setBeruf} value={beruf} />
              <SelectLabel label="Familienstand" onChange={setFamilienstand} optionLabel="label" optionValue="value" options={family_options} value={familienstand} />
              <NumberInputLabel label="Anzahl Kinder" onNumberChange={setKinder} numberValue={kinder} />
              <TextInputLabel label="Steuer-ID" onChange={setSteuerId} value={steuerId} />
              <TextInputLabel label="IBAN" onChange={setIban} value={iban} />
            </Grid>
          </DashboardContainer>
          <DividerBlock height={1} />
          <DashboardContainer>
            <h2>Sonstiges</h2>
            <DividerBlock height={1} />
            <TextAreaLabel label="Notizen" onChange={setNotizen} value={notizen} />
          </DashboardContainer>
        </TabPanel>
        <TabPanel header="Dokumente">
          <Row justifyContent="space-between">
            <h2>Dokumente</h2>
            <DocumentUploader folder={selectedFolder?.id || null} onUpload={refresh} owner={user.id} />
          </Row>
          <DividerBlock height={1} />
          <DocumentExplorer documents={docs || []} folders={folders || []} onDelete={refresh} onSelectDoc={(v) => selectDoc(v as Dokument)} onSelectFolder={refresh} owner={user.id} />
        </TabPanel>
        <TabPanel header="Vorgänge">

        </TabPanel>
      </TabView>

    </div>
  );
}