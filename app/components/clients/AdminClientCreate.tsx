'use client';

import { Button } from 'primereact/button';
import { Client } from '@/app/types/Database';
import { clientInvite } from '@/app/actions/clients';
import { Dialog } from 'primereact/dialog';
import { family_options, job_categories } from '@/app/constants/Constants';
import { NumberInputLabel, SelectLabel, TextInputLabel } from '@/app/components/forms/FormElements';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import Grid from '../layout/Grid';
import { Toast } from 'primereact/toast';
import { DatePicker } from '../forms/datepicker/DatePicker';

interface Props {
  onCreate?: () => void;
}

export default function AdminClientCreate({ onCreate }: Props) {
  const { userProfile } = useAuth();
  const [visible, setVisible] = useState(false);

  const router = useRouter();
  const toast = useRef<Toast | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  //FORM
  const [beruf, setBeruf] = useState('');
  const [berufsstatus, setBerufsstatus] = useState('');
  const [email, setEmail] = useState('');
  const [family, setFamily] = useState('');
  const [iban, setIban] = useState('');
  const [geburtsdatum, setGeburtsdatum] = useState<Date | null>(null);
  const [kinder, setKinder] = useState(0);
  const [nachname, setNachname] = useState('');
  const [notizen, setNotizen] = useState('');
  const [telefon, setTelefon] = useState('');
  const [vorname, setVorname] = useState('');

  const isValid = vorname && nachname && email;

  //USER EINLADEN
  const createUser = async () => {
    const isAgent = userProfile?.user_role == 'agency';

    setSubmitting(true);
    const clientPayload = {
      bearbeiter: isAgent ? userProfile.id : null,
      dob: geburtsdatum?.toISOString().split('T')[0] || null,
      email,
      family_status: family || 'single',
      iban,
      job: beruf,
      job_status: berufsstatus,
      kinder,
      notizen,
      user_name_last: nachname,
      status: 'pending',
      telefon,
      user_role: 'client',
      user_name_first: vorname,
    };

    try {
      await clientInvite(clientPayload);
      setVisible(false);
      setSubmitting(false);
      setBeruf('');
      setBerufsstatus('');
      setEmail('');
      setFamily('');
      setGeburtsdatum(null);
      setIban('');
      setKinder(0);
      setNachname('');
      setNotizen('');
      setSelectedClient(null);
      onCreate && onCreate();
    } catch (err) {
      console.error(err);
      setSubmitting(false);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Der Kunde konnte nicht erstellt werden. Bitte prüfen Sie ihre Angaben.',
      });
    }
  };

  return (
    <>
      <Dialog
        closable={true}
        draggable={false}
        header="Kunde erstellen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 640, width: '100%' }}
        visible={visible}
      >
        <Toast ref={toast} />
        <div className="column gap-m">
          <div className="column gap-m">
            <Grid columns={2} gap="1rem">
              <TextInputLabel label="Vorname" onChange={setVorname} value={vorname} />
              <TextInputLabel label="Nachname" onChange={setNachname} value={nachname} />
              <TextInputLabel label="E-Mail" onChange={setEmail} value={email} />
              <TextInputLabel label="Telefonnummer" onChange={setTelefon} value={telefon} />
              <DatePicker
                label="Geburtsdatum"
                onChange={setGeburtsdatum}
                value={geburtsdatum}
              />
              <TextInputLabel
                additional="(Optional)"
                label="IBAN"
                onChange={setIban}
                value={iban}
              />
              <TextInputLabel
                additional="(Optional)"
                label="Beruf"
                onChange={setBeruf}
                value={beruf}
              />
              <SelectLabel
                label="Berufsstatus"
                onChange={setBerufsstatus}
                value={berufsstatus}
                optionLabel="label"
                optionValue="value"
                options={job_categories}
              />
              <SelectLabel
                label="Familenstand"
                onChange={setFamily}
                optionLabel="label"
                optionValue="value"
                options={family_options}
                value={family}
              />
              <NumberInputLabel label="Kinder" onNumberChange={setKinder} numberValue={kinder} />
            </Grid>

            <Button
              disabled={!isValid || submitting}
              icon={submitting ? 'pi pi-spin pi-spinner' : undefined}
              label="Kunde erstellen"
              onClick={createUser}
            />
          </div>
        </div>
      </Dialog>
      <Button
        className="button-primary"
        icon="pi pi-plus"
        label="Kunden anlegen"
        onClick={() => setVisible(true)}
      />
    </>
  );
}
