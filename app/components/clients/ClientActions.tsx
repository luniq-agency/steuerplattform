'use client';

import { agencyLoadAll } from '@/app/actions/agency';
import { userUpdate } from '@/app/actions/users';
import { User } from '@/app/types/Database';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { ContextButton, PrimaryButton } from '../buttons/Buttons';
import { ArrowLeftRight, ArrowRightLeft, Repeat2 } from 'lucide-react';
import SubscriptionEditor from '../subscriptions/SubscriptionEditor';

interface Props {
  client: User;
}

export default function ClientActions({ client }: Props) {
  const op = useRef<OverlayPanel | null>(null);
  const toast = useRef<Toast | null>(null);

  // STATES
  const [editing, setEditing] = useState(false);
  const [visible, setVisible] = useState(false);

  // INPUTS
  const [agents, setAgents] = useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);

  // ACTIONS
  const transferClient = async () => {
    if (!selectedAgent) return;
    await userUpdate({ bearbeiter: selectedAgent.id }, client.id);
    setVisible(false);
    setSelectedAgent(null);
    toast.current?.show({
      severity: 'success',
      summary: 'Kunde übertragen',
      detail: 'Der kunde wurde erfolgreich an den Bearbeiter übertragen.',
    });
  };

  useEffect(() => {
    if (!client) return;

    const fetchAgents = async () => {
      const res = await agencyLoadAll();
      setAgents(res);
    };
    fetchAgents();
  }, [client]);

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        draggable={false}
        header="Kunden übertragen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <Dropdown
            filter
            filterPlaceholder="Suchen"
            onChange={(e) => setSelectedAgent(e.value)}
            optionLabel="fullName"
            options={agents
              .map((a) => ({
                ...a,
                fullName: `${a.user_name_last}, ${a.user_name_first}`,
              }))
              .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last))}
            placeholder="Agenten wählen"
            value={selectedAgent}
          />
          <PrimaryButton
            disabled={!selectedAgent}
            label="Kunden übertragen"
            onClick={transferClient}
          />
        </div>
      </Dialog>
      <OverlayPanel ref={op}>
        <div className="column gap-xs">
          <ContextButton
            icon={ArrowLeftRight}
            label="Kunden übertragen"
            onClick={(e) => {setVisible(true);op.current?.toggle(e)}}
          />
        </div>
      </OverlayPanel>
      <PrimaryButton label="Aktionen" onClick={(e) => op.current?.toggle(e)} />
    </>
  );
}
