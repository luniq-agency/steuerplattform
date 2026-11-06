'use client';

import { agentCreate } from '@/app/actions/users/agent';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { useRef, useState } from 'react';
import Button from '../../buttons/Button';
import { Plus } from 'lucide-react';

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
        vorname: agentVorname,
        nachname: agentNachname,
        rolle: 'agency',
      };

      await agentCreate(agencyPayload);
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
            disabled={!agentVorname || !agentNachname || !agentCompany || !agentEmail || submitting}
            label="Einladung versenden"
            onClick={sendInvite}
          />
        </div>
      </Dialog>
      <Button
        icon={Plus}
        label="Agentur erstellen"
        mode="secondary"
        onClick={() => setVisible(true)}
        size="small"
      />
    </>
  );
}
