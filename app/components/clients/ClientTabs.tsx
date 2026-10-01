'use client';
import { useState, useEffect, useRef } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Certificate, User } from '@/app/types/Database';
import DocumentViewer from '../documents/DocumentViewer';
import { InvoicesTableUser } from '../admin/invoices/InvoicesTable';
import CertificateFile from '../documents/CertificateFile';
import { certificatesLoadUser } from '@/app/actions/certificates';
import DividerBlock from '../DividerBlock';
import { adminsLoadAll } from '@/app/actions/admin';
import SubscriptionEditor from '../subscriptions/SubscriptionEditor';
import { useAuth } from '@/app/context/AuthContext';
import CertificateUploader from '../certificates/CertificateUploader';
import AufgabenTable from '../aufgaben/AufgabenTable';
import Grid from '../layout/Grid';
import {
  NumberInputLabel,
  SelectLabel,
  TextAreaLabel,
  TextInputLabel,
} from '../forms/FormElements';
import { family_options, job_categories } from '@/app/constants/Constants';
import { DatePicker } from '../forms/datepicker/DatePicker';
import Row from '../layout/Row';
import { userUpdate } from '@/app/actions/users';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { changeUserEmail } from '@/app/actions/users/auth';
import { SecondaryButton } from '../buttons/Buttons';
import Column from '../layout/Column';
import ErrorMessage from '../ui/ErrorMessage';

interface Props {
  onChange: (changed: boolean) => void;
  onSaveRef: (fn: () => void) => void;
  user: User;
}

type ClientFormData = {
  city: string;
  dob: Date | null;
  email: string;
  familie: string;
  iban: string;
  job: string;
  jobType: string;
  kinder: number;
  nachname: string;
  notizen: string;
  plz: string;
  steuerid: string;
  street: string;
  telefon: string;
  vorname: string;
};

const buildFormData = (user: User): ClientFormData => ({
  city: user.city || '',
  dob: user.dob ? new Date(user.dob) : null,
  email: user.email || '',
  familie: user.family_status || '',
  iban: user.iban || '',
  job: user.job || '',
  jobType: user.job_status || '',
  kinder: user.kinder || 0,
  nachname: user.user_name_last || '',
  notizen: user.notizen || '',
  plz: user.plz || '',
  steuerid: user.steuer_id || '',
  street: user.anschrift || '',
  telefon: user.telefon || '',
  vorname: user.user_name_first || '',
});

export default function ClientTabs({ onChange, onSaveRef, user }: Props) {
  const { userProfile } = useAuth();
  const [mounted, setMounted] = useState(false);

  // STATES
  const [activeIndex, setActiveIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const editorRef = useRef<{ save: () => void } | null>(null);
  const contactEditorRef = useRef<{ save: () => void } | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // FORM DATA — ein Objekt für alle Stammdaten-Felder
  const [formData, setFormData] = useState<ClientFormData>(() => buildFormData(user));
  const originalValues = useRef<ClientFormData>(buildFormData(user));

  const updateField = (patch: Partial<ClientFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleTabChange = (e: { index: number }) => {
    // Auto-save beim Tab-Wechsel
    if (activeIndex === 0) editorRef.current?.save();
    if (activeIndex === 1) contactEditorRef.current?.save();
    setActiveIndex(e.index);
  };

  // DATA
  const [admins, setAdmins] = useState<User[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const isAdmin = userProfile?.user_role === 'admin';

  // SAVING
  const save = async () => {
    const payload = {
      anschrift: formData.street,
      city: formData.city,
      dob: formData.dob ? formData.dob.toISOString().split('T')[0] : undefined,
      email: formData.email,
      family_status: formData.familie,
      iban: formData.iban,
      job: formData.job,
      job_status: formData.jobType,
      kinder: formData.kinder,
      notizen: formData.notizen,
      plz: formData.plz,
      steuer_id: formData.steuerid,
      telefon: formData.telefon,
      user_name_first: formData.vorname,
      user_name_last: formData.nachname,
    };

    await userUpdate(payload, user.id);

    // Ursprungswerte nach dem Speichern aktualisieren
    originalValues.current = { ...formData };
    onChange(false);
  };

  // Save-Funktion registrieren — nur bei Änderung von formData neu, aber
  // da formData bei jedem Feld eine neue Referenz bekommt, deckt das automatisch alles ab
  useEffect(() => {
    onSaveRef(save);
  }, [formData]);

  // INIT
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const res = await certificatesLoadUser(user.id);
        setCertificates(res);
        const adminRes = await adminsLoadAll();
        setAdmins(adminRes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    setMounted(true);
  }, [user]);

  // Änderungs-Erkennung — ein einziger Vergleich statt vieler einzelner
  const isChanged = JSON.stringify(formData) !== JSON.stringify(originalValues.current);

  useEffect(() => {
    onChange(isChanged);
  }, [isChanged]);

  const refreshCertificates = async () => {
    const res = await certificatesLoadUser(user.id);
    setCertificates(res);
  };

  const changeEmail = async () => {
    setError('');
    setSaving(true);
    try {
      await changeUserEmail(user.id, formData.email);
      setChanging(false);
    } catch (err) {
      setError('Diese E-Mail-Adresse wird schon verwendet.');
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !user) return null;

  return (
    <>
      <Dialog
        draggable={false}
        header="E-Mail-Adresse ändern"
        onHide={() => setChanging(false)}
        style={{ maxWidth: 400 }}
        visible={changing}
      >
        <Column>
          <TextInputLabel onChange={(v) => updateField({ email: v })} value={formData.email} />
          <Button disabled={saving} label="E-Mail-Adresse ändern" onClick={changeEmail} />
          {error && <ErrorMessage message={error} />}
        </Column>
      </Dialog>
      <TabView activeIndex={activeIndex} onTabChange={handleTabChange} style={{ height: '100%' }}>
        <TabPanel header="Stammdaten">
          <Grid columns={2} gap={16}>
            <TextInputLabel
              label="Vorname"
              onChange={(v) => updateField({ vorname: v })}
              value={formData.vorname}
            />
            <TextInputLabel
              label="Nachname"
              onChange={(v) => updateField({ nachname: v })}
              value={formData.nachname}
            />
            <TextInputLabel
              label="Beruf"
              onChange={(v) => updateField({ job: v })}
              value={formData.job}
            />
            <SelectLabel
              label="Jobverhältnis"
              onChange={(v) => updateField({ jobType: v })}
              optionLabel="label"
              optionValue="value"
              options={job_categories}
              value={formData.jobType}
            />
            <DatePicker
              label="Geburtsdatum"
              onChange={(e) => updateField({ dob: e as Date | null })}
              value={formData.dob}
            />
            <SelectLabel
              label="Familienstand"
              onChange={(v) => updateField({ familie: v })}
              optionLabel="label"
              optionValue="value"
              options={family_options}
              value={formData.familie}
            />
            <NumberInputLabel
              label="Kinder"
              numberValue={formData.kinder}
              onNumberChange={(v) => updateField({ kinder: v })}
            />
            <TextInputLabel
              label="IBAN"
              onChange={(v) => updateField({ iban: v })}
              value={formData.iban}
            />
            <TextInputLabel
              label="Steuer-ID"
              onChange={(v) => updateField({ steuerid: v })}
              value={formData.steuerid}
            />
            <div />
            <TextAreaLabel
              label="Notizen"
              onChange={(v) => updateField({ notizen: v })}
              value={formData.notizen}
            />
          </Grid>
        </TabPanel>
        <TabPanel header="Kontaktdaten">
          <Grid columns={2} gap={16}>
            <TextInputLabel
              label="Straße und Hausnummer"
              onChange={(v) => updateField({ street: v })}
              value={formData.street}
            />
            <Row gap={16}>
              <TextInputLabel
                label="PLZ"
                onChange={(v) => updateField({ plz: v })}
                value={formData.plz}
              />
              <TextInputLabel
                label="Ort"
                onChange={(v) => updateField({ city: v })}
                value={formData.city}
              />
            </Row>
            <Row alignItems="end" gap={8}>
              <TextInputLabel label="E-Mail" onChange={() => {}} readonly value={formData.email} />
              <SecondaryButton label="Ändern" onClick={() => setChanging(true)} size="small" />
            </Row>
            <TextInputLabel
              label="Telefon"
              onChange={(v) => updateField({ telefon: v })}
              value={formData.telefon}
            />
          </Grid>
        </TabPanel>
        <TabPanel header="Aufgaben">
          <AufgabenTable staff={admins} user={user} />
        </TabPanel>
        <TabPanel header="Zertifikatsdatei">
          <div className="column width-100">
            <div className="row space-between width-100">
              <h3>Zertifikatsdateien</h3>
              <CertificateUploader user={user} />
            </div>
            <DividerBlock height={2} />
            <div className="grid columns-four gap-m">
              {certificates.map((c, i) => (
                <CertificateFile certificate={c} key={i} onDelete={refreshCertificates} />
              ))}
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Dokumente">
          <DocumentViewer user={user} />
        </TabPanel>
        <TabPanel header="Rechnungen">
          <InvoicesTableUser user={user} />
        </TabPanel>
        {isAdmin && (
          <TabPanel header="Abos">
            <SubscriptionEditor user={user} />
          </TabPanel>
        )}
      </TabView>
    </>
  );
}
