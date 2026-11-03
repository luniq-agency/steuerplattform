'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import DividerBlock from '@/app/components/DividerBlock';
import { Rechnung } from '@/app/types/rechnung/Rechnungen';
import Row from '@/app/components/layout/Row';
import Button from '@/app/components/buttons/Button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatCurrency, formatDate } from '@/app/utils/formats';

interface Props {
  clients: User[];
  invoices?: Rechnung[];
}
export default function Rechnungen({ clients, invoices }: Props) {
  const { userProfile } = useAuth();
  if (!userProfile) return;

  if (userProfile.rolle != 'admin') redirect('/admin');

  return (
    <div className="page-content">
      <Row alignItems="center" justifyContent='space-between'>
        <h1>Rechnungen</h1>
        <Link href="/admin/rechnungen/neu">
          <Button icon={Plus} label="Neue Rechnung" mode="secondary" size="small" />
        </Link>
      </Row>
      <DividerBlock height={2} />
      <DataTable value={invoices}>
        <Column header="#" />
        <Column body={(rowData) => formatCurrency(rowData.betrag_gesamt)} header="Betrag" />
        <Column body={(rowData) => formatDate(rowData.rechnungsdatum)} header="Rechnungsdatum" />
      </DataTable>
    </div>
  );
}
