'use client';

import { redirect, useRouter } from 'next/navigation';
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
import { invoice_status } from '@/app/constants/Constants';
import Tag from '@/app/components/tag/Tag';
import Grid from '@/app/components/layout/Grid';
import StatCard from '@/app/components/cards/StatCard';

interface Props {
  clients: User[];
  invoices?: Rechnung[];
}
export default function Rechnungen({ clients, invoices }: Props) {
  const { userProfile } = useAuth();
  const router = useRouter();
  if (!userProfile) return;

  if (userProfile.rolle != 'admin') redirect('/admin');

  // TEMPLATES
  const clientTemplate = (rowData: Rechnung) => {
    const user = clients.find((c) => c.id == rowData.mandant);
    const name = user ? `${user.nachname}, ${user.vorname}` : '–';
    return <span>{name}</span>
  }

  const statusTemplate = (rowData: Rechnung) => {
    const status = invoice_status.find((i) => i.value == rowData.status);
    if (!status) return;
    return <Tag label={status.label} />
  }

  // ACTIONS
  const select = (rowData: Rechnung) => {
    router.push(`/admin/rechnungen/${rowData.id}`)
  }

  // CALC
  const total = invoices?.reduce((sum, d) => sum + (d.betrag_gesamt ?? 0), 0);

  return (
    <div className="page-content">
      <Row alignItems="center" justifyContent='space-between'>
        <h1>Rechnungen</h1>
        <Link href="/admin/rechnungen/neu">
          <Button icon={Plus} label="Neue Rechnung" mode="secondary" size="small" />
        </Link>
      </Row>
      <DividerBlock height={1} />
      <Grid columns={3}>
        <StatCard header="Einkommen (2026)" mode="currency" value={total || 0} />
        <StatCard header="Versendete Rechnungen" value={invoices?.length || 0} />
      </Grid>
      <DividerBlock height={1} />
      <DataTable onRowClick={(v => select(v.data as Rechnung))} value={invoices}>
        <Column field="rechnungsnummer" header="#" />
        <Column body={clientTemplate} header="Kunde" />
        <Column body={(rowData) => formatCurrency(rowData.betrag_gesamt)} header="Betrag" />
        <Column body={(rowData) => formatDate(rowData.rechnungsdatum)} header="Rechnungsdatum" />
        <Column body={statusTemplate} header="Status" />
      </DataTable>
    </div>
  );
}
