'use client';

import { Agent, Client, User } from '@/app/types/Database';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useEffect, useRef, useState } from 'react';
import { SelectLabel } from '../../forms/FormElements';
import { agencyLoadAll, agencyLookup } from '@/app/actions/agency';
import { clientUpdate } from '@/app/actions/clients';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { userUpdateCreate } from '@/app/actions/update';
import { notificationCreate } from '@/app/actions/notification';

interface Props {
  client: Client;
}

export default function ClientActions({ client }: Props) {
  const { userProfile } = useAuth();
  const router = useRouter();
  const op = useRef<OverlayPanel | null>(null);

  const [agents, setAgents] = useState<User[]>([]);
  const agentOptions = agents.map((a) => ({
    ...a,
    fullName: `${a.user_name_last}, ${a.user_name_last}`,
  }));

  useEffect(() => {
    if (!client) return;
    const fetchAgents = async () => {
      try {
        const res = await agencyLoadAll();
        setAgents(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAgents();
  }, [client]);

  const [submitting, setSubmitting] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [transferTarget, setTransferTarget] = useState<User | null>(null);

  const confirmTransfer = async () => {
    if (!transferTarget) return;
    setSubmitting(true);
    const agent = await agencyLookup(transferTarget.id);

    //KUNDE
    const payload = {
      bearbeiter: agent.id,
    };
    await clientUpdate(payload, client.id);

    //BENACHRICHTIGUNG
    const notificationPayload = {
      message: `${userProfile?.user_name_first} ${userProfile?.user_name_last} hat dir den Kunden ${client.vorname} ${client.nachname} zugewiesen.`,
      read: false,
      recipient: transferTarget.user_uuid,
      title: 'Neuer Kunde',
      type: '',
    };
    await notificationCreate(notificationPayload, transferTarget);

    //UPDATE
    const updatePayload = {
      body: `Kunde wurde an ${agent.vorname} ${agent.nachname} übertragen`,
      created_by: `${userProfile?.user_name_first} ${userProfile?.user_name_last}`,
    };
    await userUpdateCreate(updatePayload);

    //RESET
    setTransferring(false);
    setSubmitting(false);
    setTransferTarget(null);
    router.refresh();
  };

  return (
    <>
      <Dialog
        draggable={false}
        header="Kunde übertragen"
        onHide={() => setTransferring(false)}
        style={{ maxWidth: 320, width: '100%' }}
        visible={transferring}
      >
        <div className="column gap-m">
          <div className="column gap-xs">
            <label>Agenturist</label>
            <Dropdown
              onChange={(e) => setTransferTarget(e.value)}
              optionLabel="fullName"
              options={agentOptions}
              value={transferTarget}
            />
          </div>
          <Button
            disabled={submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Bestätigen"
            onClick={confirmTransfer}
          />
        </div>
      </Dialog>
      <OverlayPanel ref={op}>
        <div className="column gap-xs">
          <Button
            className="button-context"
            icon="pi pi-euro"
            label="Kunde übertragen"
            onClick={() => setTransferring(true)}
          />
          <Button
            className="button-context"
            icon="pi pi-trash"
            label="Kunde löschen"
            style={{ color: 'red' }}
          />
        </div>
      </OverlayPanel>
      <div className="row gap-xs">
        <Button
          className="button-square button-bordered"
          icon="pi pi-ellipsis-v"
          onClick={(e) => op.current?.toggle(e)}
          style={{ backgroundColor: 'white' }}
          text
        />
      </div>
    </>
  );
}
