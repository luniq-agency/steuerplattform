'use client';

import { clientLookup, clientLookupFromUser, clientUpdate } from '@/app/actions/clients';
import { Client } from '@/app/types/Database';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { client_status, family_options, job_categories } from '@/app/constants/Constants';
import { useEffect, useRef, useState } from 'react';
import { documentsLoadUser } from '@/app/actions/documents';
import type { Document, User } from '@/app/types/Database';
import { useAuth } from '@/app/context/AuthContext';
import {
  NumberInputLabel,
  SelectLabel,
  SkeletonLoaderLabel,
  SocialMediaInput,
  TextAreaLabel,
  TextInputLabel,
} from '../../forms/FormElements';
import DividerBlock from '../../DividerBlock';
import { userUpdateCreate } from '@/app/actions/update';
import { userUpdate } from '@/app/actions/users';
import Row from '../../layout/Row';
import { Toast } from 'primereact/toast';

interface Props {
  user?: User;
}

export default function ClientEditor({ user: userProp }: Props) {
  const toast = useRef<Toast | null>(null);
  const { userProfile } = useAuth();

  const user = userProp ?? userProfile; // ← Fallback auf eingeloggten User

  // STATES
  const [statusChanged, setStatusChanged] = useState(false);
  const [updating, setUpdating] = useState(false);

  // CLIENT DATA
  const [clientDob, setClientDob] = useState<Date | null>(user?.dob ? new Date(user.dob) : null);
  const [clientFamily, setClientFamily] = useState(user?.family_status || '');
  const [clientIban, setClientIban] = useState(user?.iban || '');
  const [clientJob, setClientJob] = useState(user?.job || '');
  const [clientJobType, setClientJobType] = useState(user?.job_status || '');
  const [clientKids, setClientKids] = useState(user?.kinder || 0);
  const [clientNachname, setClientNachname] = useState(user?.user_name_last || '');
  const [clientNotes, setClientNotes] = useState(user?.notizen || '');
  const [clientVorname, setClientVorname] = useState(user?.user_name_first || '');
  const [clientStatus, setClientStatus] = useState(user?.status || '');
  const [clientTaxId, setClientTaxId] = useState(user?.steuer_id || '');

  const originalDob = user?.dob ? new Date(user.dob).toDateString() : null;
  const currentDob = clientDob ? clientDob.toDateString() : null;
  const originalFamily = family_options.find((t) => t.value === user?.family_status)?.label ?? '';

  const isChanged =
    clientVorname !== user?.user_name_first ||
    clientNachname !== user.user_name_last ||
    clientJob !== user.job ||
    clientIban !== user.iban ||
    clientKids !== user.kinder ||
    clientFamily !== originalFamily ||
    currentDob !== originalDob;

  const hasProfile = user?.user_uuid;

  const updateUser = async () => {
    setUpdating(true);

    if (clientStatus != user?.status) {
      const status = client_status.find((t) => t.value === clientStatus);
      const updatePayload = {
        body: `Status auf '${status?.label}' geändert.`,
        created_at: new Date(),
        created_by: `${userProfile?.user_name_first} ${userProfile?.user_name_last}`,
        user: user?.id,
      };
      setStatusChanged(true);
      await userUpdateCreate(updatePayload);
    }

    const payload = {
      dob: clientDob
        ? `${clientDob.getFullYear()}-${String(clientDob.getMonth() + 1).padStart(2, '0')}-${String(clientDob.getDate()).padStart(2, '0')}`
        : undefined,
      job: clientJob,
      job_status: clientJobType,
      family_status: clientFamily,
      iban: clientIban,
      kinder: clientKids,
      notizen: clientNotes,
      steuer_id: clientTaxId,
      user_name_last: clientNachname,
      status: clientStatus,
      user_name_first: clientVorname,
    };

    if (!user) return;

    try {
      await userUpdate(payload, user.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Änderungen gespeichert',
        detail: 'Die Änderungen wurden gespeichert.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="column gap-m">
      <Toast ref={toast} />
      <h3>Stammdaten</h3>
      <div className="grid columns-two gap-m mobile-column">
        <TextInputLabel label="Vorname" onChange={setClientVorname} value={clientVorname} />
        <TextInputLabel label="Nachname" onChange={setClientNachname} value={clientNachname} />
        <TextInputLabel label="Beruf" onChange={setClientJob} value={clientJob} />
        <SelectLabel
          label="Jobverhältnis"
          onChange={setClientJobType}
          optionLabel="label"
          optionValue="value"
          options={job_categories}
          value={clientJobType}
        />
        <div className="column gap-xs">
          <label>Geburtstdatum</label>
          <Calendar
            dateFormat="dd.mm.yy"
            onChange={(e) => setClientDob(e.value as Date | null)}
            value={clientDob}
          />
        </div>
        <SelectLabel
          label="Familienstand"
          onChange={setClientFamily}
          optionLabel="label"
          optionValue="value"
          options={family_options}
          value={clientFamily}
        />
        <NumberInputLabel label="Kinder" numberValue={clientKids} onNumberChange={setClientKids} />
        <TextInputLabel label="IBAN" onChange={setClientIban} value={clientIban} />
        <TextInputLabel label="Steuer-ID" onChange={setClientTaxId} value={clientTaxId} />
        <TextAreaLabel label="Notizen" onChange={setClientNotes} value={clientNotes} />
        {userProfile?.user_role === 'admin' && (
          <SelectLabel
            label="Status"
            onChange={setClientStatus}
            options={client_status}
            optionLabel="label"
            optionValue="value"
            value={clientStatus}
          />
        )}
      </div>
      <Button
        className="button-primary"
        disabled={!isChanged || updating}
        icon={updating ? 'pi pi-spinner' : undefined}
        label="Änderungen speichern"
        onClick={updateUser}
        style={{ width: 'fit-content' }}
      />
    </div>
  );
}

export function ClientContactEditor({ user }: Props) {
  const toast = useRef<Toast | null>(null);
  const [updating, setUpdating] = useState(false);

  const { clientProfile } = useAuth();

  //VARIABLEN
  const [clientCity, setClientCity] = useState(user?.city || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientId, setClientId] = useState(user?.id);
  const [clientInstagram, setClientInstagram] = useState(user?.instagram || '');
  const [clientLinkedin, setClientLinkedin] = useState(user?.linkedin || '');
  const [clientPhone, setClientPhone] = useState(user?.telefon || '');
  const [clientStreet, setClientStreet] = useState(user?.anschrift || '');
  const [clientWebsite, setClientWebsite] = useState(user?.website || '');
  const [clientZip, setClientZip] = useState(user?.plz || '');

  const hasProfile = user?.user_uuid;

  const updateUser = async () => {
    setUpdating(true);
    const payload = {
      anschrift: clientStreet,
      city: clientCity,
      instagram: clientInstagram,
      linkedin: clientLinkedin,
      plz: clientZip,
      telefon: clientPhone,
      website: clientWebsite,
    };

    if (!user || !clientId) return;

    try {
      await clientUpdate(payload, clientId);
      toast.current?.show({
        severity: 'success',
        summary: 'Änderungen gespeichert',
        detail: 'Die Änderungen wurden gespeichert.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="column gap-m">
      <Toast ref={toast} />
      <h3>Kontaktdaten</h3>
      <div className="grid columns-two gap-m mobile-column">
        <TextInputLabel
          label="Straße & Hausnummer"
          onChange={setClientStreet}
          value={clientStreet}
        />
        <Row>
          <TextInputLabel label="PLZ" onChange={setClientZip} value={clientZip} />
          <TextInputLabel label="Ort" onChange={setClientCity} value={clientCity} />
        </Row>
        <TextInputLabel
          label="E-Mail"
          onChange={setClientEmail}
          readonly={hasProfile ? false : true}
          value={clientEmail}
        />
        <TextInputLabel label="Telefon" onChange={setClientPhone} value={clientPhone} />
        <TextInputLabel
          additional="(optional)"
          label="Webseite"
          onChange={setClientWebsite}
          value={clientWebsite}
        />
      </div>
      <DividerBlock height={0.5} />
      <div className="column gap-s">
        <h4>Soziale Profile</h4>
        <div className="grid columns-two gap-m mobile-column">
          <SocialMediaInput
            image="/icons/instagram.svg"
            onChange={setClientInstagram}
            value={clientInstagram}
          />
          <SocialMediaInput
            image="/icons/linkedin.svg"
            onChange={setClientLinkedin}
            value={clientLinkedin}
          />
        </div>
      </div>
      <Button
        className="button-primary"
        disabled={updating}
        icon={updating ? 'pi pi-spinner' : undefined}
        label="Änderungen speichern"
        onClick={updateUser}
        style={{ width: 'fit-content' }}
      />
    </div>
  );
}
