'use client';

import DashboardContainer from "@/app/components/layout/DashboardContainer";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { NumberInputLabel, TextAreaLabel, TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import Grid from "@/app/components/layout/Grid";
import { Certificate, User } from '@/app/types/Database';
import { useEffect, useRef, useState } from 'react';
import { family_options, job_categories } from '@/app/constants/Constants';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import DividerBlock from '@/app/components/DividerBlock';
import { TabPanel, TabView } from 'primereact/tabview';
import { Accordion, AccordionTab } from "primereact/accordion";
import Row from "@/app/components/layout/Row";
import Button from "@/app/components/buttons/Button";
import { toDateString } from "@/app/utils/formats";
import { userUpdate } from "@/app/actions/users";
import { Vorgang } from "@/app/types/vorgang";
import VorgangCard from "@/app/components/vorgang/VorgangCard";
import { Plus } from "lucide-react";
import Link from "next/link";
import DocumentExplorer from "@/app/components/documents/DocumentExplorer";
import { Dokument, DokumentOrdner } from "@/app/types/docs";
import { documentsLoadUser } from "@/app/actions/documents";
import { foldersLoadUser } from "@/app/actions/folders";
import { fetchVorgaengeByClient } from "@/app/actions/vorgang/vorgang";
import { Dialog } from "primereact/dialog";
import DocumentPreviewer from "@/app/components/documents/DocumentPreviewer";
import DocumentUploader from "@/app/components/documents/DocumentUploader";
import RechnungTable from "@/app/components/invoices/RechnungTable";
import { Rechnung } from "@/app/types/rechnung/Rechnungen";
import { invoicesLoadUser } from "@/app/actions/invoice";
import CertificateFile from "@/app/components/documents/CertificateFile";
import { Zertifikat } from "@/app/types/certificates";
import { certificatesLoadUser, certificateUpdate } from "@/app/actions/certificates";
import CertificateUploader from "@/app/components/certificates/CertificateUploader";

interface Props {
  bearbeiter?: User | null;
  user: User;
}

export default function KundeDetailPage({ bearbeiter, user }: Props) {
  const [hasChanges, setHasChanges] = useState(false);
  const saveRef = useRef<(() => void) | null>(null);
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    if (!hasChanges) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      if (!href.startsWith('http')) {
        e.preventDefault();
        const confirmed = window.confirm(
          'Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?'
        );
        if (confirmed) {
          setHasChanges(false);
          router.push(href);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasChanges, router]);

  // DATA
  const [docs, setDocs] = useState<Dokument[]>([]);
  const [folders, setFolders] = useState<DokumentOrdner[]>([]);
  const [rechnungen, setRechungen] = useState<Rechnung[]>([]);
  const [tickets, setTickets] = useState<Vorgang[]>([]);
  const [zertifikate, setZertifikate] = useState<Zertifikat[]>([]);

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      const [docRes, folderRes, rechnungRes, ticketRes, zertRes] = await Promise.all([
        documentsLoadUser(user.id),
        foldersLoadUser(user.id),
        invoicesLoadUser(user.id),
        fetchVorgaengeByClient(user.id),
        certificatesLoadUser(user.id)
      ])
      setDocs(docRes);
      setFolders(folderRes);
      setRechungen(rechnungRes);
      setTickets(ticketRes);
      setZertifikate(zertRes);
    }
    fetchData()
  }, [user])

  // INPUTS
  const [beruf, setBeruf] = useState(user?.beruf || '');
  const [berufsstatus, setBerufsstatus] = useState(user?.berufsstatus || 'employed');
  const [email, setEmail] = useState(user?.email || '');
  const [familienstand, setFamilienstand] = useState(user?.familienstand || 'single');
  const [geburtsdatum, setGeburtsdatum] = useState<Date | null>(user?.geburtsdatum ? new Date(user.geburtsdatum) : null);
  const [hausnummer, setHausnummer] = useState(user?.hausnummer || '');
  const [iban, setIban] = useState(user?.iban || '');
  const [kinder, setKinder] = useState(user?.kinder ?? 0);
  const [nachname, setNachname] = useState(user?.nachname || '');
  const [notizen, setNotizen] = useState(user?.notizen || '');
  const [ort, setOrt] = useState(user?.ort || '');
  const [plz, setPlz] = useState(user?.plz || '');
  const [steuerId, setSteuerId] = useState(user?.steuer_id || '');
  const [strasse, setStrasse] = useState(user?.strasse || '');
  const [telefon, setTelefon] = useState(user?.telefon || '');
  const [vorname, setVorname] = useState(user?.vorname || '');

  // SELECTIONS
  const [selectedDoc, setSelectedDoc] = useState<Dokument | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DokumentOrdner | null>(null);

  // STATES
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState(false);

  // ACTIONS
  const saveClient = async () => {
    setSaving(true);
    const payload = {
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
      rolle: 'client',
      steuer_id: steuerId,
      strasse,
      telefon,
      vorname,
    }
    await userUpdate(payload, user?.id);
    toast.current?.show({
      severity: 'success',
      summary: 'Änderungen gespeichert',
      detail: 'Der Kunde wurde erfolgreich aktualisiert.',
    });
    setSaving(false);
  }


  // DOCS
  const refreshCertificates = async () => {
    const res = await certificatesLoadUser(user.id)
    setZertifikate(res);
  }

  const refreshDocs = async () => {
    const docRes = await documentsLoadUser(user.id);
    const folderRes = await foldersLoadUser(user.id);
    setDocs(docRes);
    setFolders(folderRes);
  }

  const selectDoc = (d: Dokument) => {
    setSelectedDoc(d);
    setVisible(true);
  }

  const selectFolder = (f: DokumentOrdner) => {
    setSelectedFolder(f);
  }

  return (
    <div className="page-content column">
      <Dialog onHide={() => setVisible(false)} style={{ maxWidth: "90vw", minHeight: "90vh" }} visible={visible}>
        {selectedDoc && <DocumentPreviewer doc={selectedDoc} />}
      </Dialog>
      <Toast ref={toast} />
      <Row justifyContent="space-between">
        <h1>{user?.nachname}, {user?.vorname}</h1>
        <Button disabled={saving} label="Speichern" mode="secondary" onClick={saveClient} size="small" />
      </Row>
      <DividerBlock height={1} />
      <TabView scrollable>
        <TabPanel header="Daten">
          <Row alignItems="center" minHeight={30}>
            <h2>Stammdaten</h2>
          </Row>
          <DividerBlock height={1} />
          <Accordion className="accordion-admin">
            <AccordionTab header="Allgemeine Angaben">
              <Grid columns={2} gap={16}>
                <TextInputLabel label="Vorname" onChange={setVorname} value={vorname} />
                <TextInputLabel label="Nachname" onChange={setNachname} value={nachname} />
                <DatePicker label="Geburtsdatum" onChange={setGeburtsdatum} value={geburtsdatum} />
              </Grid>
            </AccordionTab>
            <AccordionTab header="Anschrift & Kontakt">
              <Grid columns={2} gap={16}>
                <TextInputLabel label="Strasse" onChange={setStrasse} value={strasse} />
                <TextInputLabel label="Hausnummer" onChange={setHausnummer} value={hausnummer} />
                <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
                <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
                <TextInputLabel label="E-Mail" onChange={setEmail} value={email} />
                <TextInputLabel label="Telefon" onChange={setTelefon} value={telefon} />
              </Grid>

            </AccordionTab>
            <AccordionTab header="Steuern & Berufsstatus">
              <Grid columns={2} gap={16}>
                <SelectLabel label="Berufsstatus" onChange={setBerufsstatus} optionLabel="label" optionValue="value" options={job_categories} value={berufsstatus} />
                <TextInputLabel label="Beruf" onChange={setBeruf} value={beruf} />
                <SelectLabel label="Familienstand" onChange={setFamilienstand} optionLabel="label" optionValue="value" options={family_options} value={familienstand} />
                <NumberInputLabel label="Anzahl Kinder" onNumberChange={setKinder} numberValue={kinder} />
                <TextInputLabel label="IBAN" onChange={setIban} value={iban} />
                <TextInputLabel label="Steuer-ID" onChange={setSteuerId} value={steuerId} />
              </Grid>
            </AccordionTab>
            <AccordionTab header="Sonstiges">
              <Grid columns={1} gap={16}>
                <TextAreaLabel onChange={setNotizen} value={notizen} />
              </Grid>
            </AccordionTab>
          </Accordion>
        </TabPanel>
        <TabPanel header="Vorgänge">
          <Row alignItems="center" justifyContent="space-between">
            <h2>Vorgänge</h2>
            <Link href="/admin/vorgaenge/neu">
              <Button icon={Plus} label="Neuer Vorgang" mode="tertiary" size="small" />
            </Link>
          </Row>
          <DividerBlock height={1} />
          {tickets.length > 0 ? tickets.map((t, i) => <VorgangCard key={i} level="admin" vorgang={t} />) : <span>Bisher wurden noch keine Vorgänge für diesen Kunden angelegt.</span>}
        </TabPanel>
        <TabPanel header="Dokumente">
          <Row alignItems="center" justifyContent="space-between">
            <h2>Dokumente</h2>
            <DocumentUploader folder={selectedFolder?.id || null} onUpload={refreshDocs} owner={user.id} />
          </Row>
          <DividerBlock height={1} />
          <DocumentExplorer documents={docs} folders={folders} onDelete={refreshDocs} onSelectDoc={selectDoc} onSelectFolder={(v) => selectFolder(v as DokumentOrdner)} owner={user.id} />
        </TabPanel>
        <TabPanel header="Zertifikatsdatei">
          <Row alignItems="center" justifyContent="space-between">
            <h2>Zertifikatsdateien</h2>
            <CertificateUploader onUpload={refreshCertificates} user={user} />
          </Row>
          <DividerBlock height={1} />
          <Grid columns={4} gap={16}>
            {zertifikate.map((c, i) => <CertificateFile certificate={c} key={i} onDelete={refreshCertificates} />)}
          </Grid>
        </TabPanel>
        <TabPanel header="Rechnungen">
          <Row alignItems="center" justifyContent="space-between">
            <h2>Rechnungen</h2>
            <Link href={`/admin/rechnungen/neu?user=${user.id}`}>
              <Button label="Neue Rechnung" mode="secondary" size="small" />
            </Link>
          </Row>
          <DividerBlock height={1} />
          <RechnungTable rechnungen={rechnungen || []} role="admin" />
        </TabPanel>
      </TabView>

    </div>
  );
}