'use client';

import { User } from '@/app/types/Database';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';
import { ContextButton } from '../buttons/Buttons';
import { Lock } from 'lucide-react';
import Button from '../buttons/Button';
import { inZwischenablage } from '@/app/utils/interactions';
import { Toast } from 'primereact/toast';

interface Props {
  agent: User;
}

export default function AgencyActions({ agent }: Props) {
  const op = useRef<OverlayPanel | null>(null);
  const toast = useRef<Toast | null>(null);

  // ACTIONS
  const copyLink = async () => {
    const url = `https://app.advact.de/konto-erstellen/${agent.id}`
    const ok = await inZwischenablage(url);
    op.current?.hide();
    toast.current?.show(
      ok
        ? { severity: 'success', summary: 'Link kopiert', detail: 'Der Einladungslink ist in der Zwischenablage.', life: 3000 }
        : { severity: 'error', summary: 'Kopieren fehlgeschlagen', detail: url, life: 8000 }
    );
  };

  const resetPassword = async () => {

  };

  return (
    <>
      <Toast ref={toast} />
      <OverlayPanel ref={op}>
        <div className="column gap-xs">
          <ContextButton icon={Lock} label="Einladungslink kopieren" onClick={copyLink} />
          <ContextButton icon={Lock} label="Password zurücksetzen" onClick={resetPassword} />
        </div>
      </OverlayPanel>
      <Button label="Aktionen" mode="secondary" onClick={(e) => op.current?.toggle(e)} size="small" />
    </>
  );
}
