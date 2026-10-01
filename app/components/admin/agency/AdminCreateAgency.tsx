'use client';

import { agencyCreate } from '@/app/actions/agency';
import { userCreate } from '@/app/actions/users';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';

export default function AdminCreateAgency() {
  const toast = useRef<Toast | null>(null);
  const { userProfile } = useAuth();
  const [visible, setVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const [agentVorname, setAgentVorname] = useState('');
  const [agentNachname, setAgentNachname] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentCompany, setAgentCompany] = useState('');

  const sendInvite = async () => {
    setSubmitting(true);
    if (!userProfile) return;

    try {
      const agencyPayload = {
        email: agentEmail,
        firma: agentCompany,
        referrer: userProfile.id,
        status: 'pending',
        user_name_first: agentVorname,
        user_name_last: agentNachname,
        user_role: 'agency',
      };

      await agencyCreate(agencyPayload);
      setVisible(false);
      toast.current?.show({
        severity: 'success',
        summary: 'Agentur erstellt',
        detail: 'Der Agenturist wurde erstellt und eine Einladungs-E-Mail versendet.',
      });
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler aufgetreten',
        detail: 'Der Agenturist konnte nicht erstellt werden. Bitte probiere es erneut.',
      });
    }
    setSubmitting(false);
    setAgentVorname('');
    setAgentCompany('');
    setAgentEmail('');
    setAgentNachname('');
    router.refresh();
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        closable={true}
        draggable={false}
        header="Agenturist erstellen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 640, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <div className="column gap-xs">
            <label>Vorname</label>
            <InputText onChange={(e) => setAgentVorname(e.target.value)} value={agentVorname} />
          </div>
          <div className="column gap-xs">
            <label>Nachname</label>
            <InputText onChange={(e) => setAgentNachname(e.target.value)} value={agentNachname} />
          </div>
          <div className="column gap-xs">
            <label>E-Mail-Adresse</label>
            <InputText
              onChange={(e) => setAgentEmail(e.target.value)}
              type="email"
              value={agentEmail}
            />
          </div>
          <div className="column gap-xs">
            <label>Unternehmen</label>
            <InputText onChange={(e) => setAgentCompany(e.target.value)} value={agentCompany} />
          </div>
          <Button
            className="button-primary"
            disabled={!agentVorname || !agentNachname || !agentCompany || !agentEmail || submitting}
            icon={submitting ? 'pi pi-spin pi-spinner' : undefined}
            label="Einladung versenden"
            onClick={sendInvite}
            style={{ width: 'fit-content' }}
          />
        </div>
      </Dialog>
      <Button
        className="button-primary"
        icon="pi pi-plus"
        label="Agentur erstellen"
        onClick={() => setVisible(true)}
      />
    </>
  );
}
