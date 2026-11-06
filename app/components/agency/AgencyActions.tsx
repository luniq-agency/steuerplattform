'use client';

import { User } from '@/app/types/Database';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';
import { ContextButton } from '../buttons/Buttons';
import { Lock } from 'lucide-react';
import Button from '../buttons/Button';

interface Props {
  agent: User;
}

export default function AgencyActions({ agent }: Props) {
  const op = useRef<OverlayPanel | null>(null);

  const resetPassword = async () => {

  }
  return (
    <>
      <OverlayPanel ref={op}>
        <div className="column gap-xs">
          <ContextButton icon={Lock} label="Password zurücksetzen" onClick={resetPassword} />
        </div>
      </OverlayPanel>
      <Button label="Aktionen" mode="secondary" onClick={(e) => op.current?.toggle(e)} size="small" />
    </>
  );
}
