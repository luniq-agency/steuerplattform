'use client';

import { useRef } from 'react';
import { Toast } from 'primereact/toast';
import RechnungEditor from '@/app/components/shared/rechnungen/RechnungEditor';
import { Rechnung } from '@/app/types/rechnung/Rechnungen';

interface Props {
  invoice: Rechnung;
}

export default function RechnungPage({ invoice }: Props) {
  const toast = useRef<Toast | null>(null);

  console.log('Rechnung:', invoice);
  
  return (
    <div className="content-wrapper">
      <Toast ref={toast} />
      <RechnungEditor header="Rechnung bearbeiten" rechnung={invoice} />
    </div>
  );
}
