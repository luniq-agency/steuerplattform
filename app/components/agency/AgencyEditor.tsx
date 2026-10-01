'use client';

import { Button } from 'primereact/button';
import { useState } from 'react';
import type { User } from '@/app/types/Database';
import { useAuth } from '@/app/context/AuthContext';
import { TextInputLabel } from '@/app/components/forms/FormElements';
import { userUpdate } from '@/app/actions/users';

interface Props {
  user?: User;
}

export default function AgencyEditor({ user: userProp }: Props) {
  const { userProfile } = useAuth();

  const user = userProp ?? userProfile;

  if (!user) return null;

  // STATES
  const [updating, setUpdating] = useState(false);

  // CLIENT DATA
  const [agentCompany, setAgentCompany] = useState(user.firma || '');
  const [agentEmail, setAgentEmail] = useState(user.email || '');
  const [agentNachname, setAgentNachname] = useState(user.user_name_last || '');
  const [agentPhone, setAgentPhone] = useState(user.telefon || '');
  const [agentVorname, setAgentVorname] = useState(user.user_name_first || '');

  const isChanged =
    agentVorname !== user?.user_name_first ||
    agentNachname !== user.user_name_last ||
    agentCompany !== user.firma;

  const updateUser = async () => {
    setUpdating(true);

    const payload = {
      email: agentEmail,
      firma: agentCompany,
      telefon: agentPhone,
      user_name_last: agentNachname,
      user_name_first: agentVorname,
    };

    try {
      await userUpdate(payload, user.id);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="column gap-m">
      <h3>Stammdaten</h3>
      <div className="grid columns-two gap-m mobile-column">
        <TextInputLabel label="Vorname" onChange={setAgentVorname} value={agentVorname} />
        <TextInputLabel label="Nachname" onChange={setAgentNachname} value={agentNachname} />
        <TextInputLabel label="Firma" onChange={setAgentCompany} value={agentCompany} />
        <TextInputLabel label="E-Mail" onChange={setAgentEmail} value={agentEmail} />
        <TextInputLabel label="Telefon" onChange={setAgentPhone} value={agentPhone} />
      </div>
      <Button
        className="button-primary"
        disabled={!isChanged || updating}
        icon={updating ? 'pi pi-spin pi-spinner' : undefined}
        label="Änderungen speichern"
        onClick={updateUser}
        style={{ width: 'fit-content' }}
      />
    </div>
  );
}
