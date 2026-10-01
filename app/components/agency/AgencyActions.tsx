'use client';

import { User } from '@/app/types/Database';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef } from 'react';

interface Props {
  agent: User;
}

export default function AgencyActions({ agent }: Props) {
  const op = useRef<OverlayPanel | null>(null);

  return (
    <>
      <OverlayPanel ref={op}>
        <div className="column gap-xs">
          <Button className="button-context" icon="pi pi-lock" label="Password zurücksetzen" />
        </div>
      </OverlayPanel>
      <Button label="Aktionen" onClick={(e) => op.current?.toggle(e)} />
    </>
  );
}
