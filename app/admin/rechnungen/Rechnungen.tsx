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
import Grid from '@/app/components/layout/Grid';
import StatCard from '@/app/components/cards/StatCard';
import RechnungTable from '@/app/components/invoices/RechnungTable';
import SearchBox from '@/app/components/forms/SearchBox';
import { SelectLabel } from '@/app/components/inputs/Select';
import { useMemo, useState } from 'react';
import { invoice_status } from '@/app/constants/Constants';

const STATUS_OPTIONEN = [{ label: 'Alle Rechnungen', value: '' }, ...invoice_status];

const normalisieren = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');

interface Props {
  clients: User[];
  invoices?: Rechnung[];
}
export default function Rechnungen({ clients, invoices }: Props) {
  const { userProfile } = useAuth();
  const router = useRouter();


  // FILTER
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // CALC
  const total = invoices?.reduce((sum, d) => sum + (d.betrag_gesamt ?? 0), 0);

  // FILTER
  const gefiltert = useMemo(() => {
    const begriff = normalisieren(search.trim());

    return invoices?.filter((k) => {
      if (statusFilter && k.status !== statusFilter) return false;
      if (!begriff) return true;

      const text = normalisieren(
        [k.empfaenger]
          .filter(Boolean)
          .join(' ')
      );
      return text.includes(begriff);
    });
  }, [invoices, search, statusFilter]);

  const filterAktiv = !!search || !!statusFilter;

  const resetFilter = () => {
    setSearch('');
    setStatusFilter('');
  };

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
      <DividerBlock height={1} />
      <Grid columns={3}>
        <StatCard header="Einkommen (2026)" mode="currency" value={total || 0} />
        <StatCard header="Versendete Rechnungen" value={invoices?.length || 0} />
      </Grid>
      <DividerBlock height={1} />
      <Row alignItems="end" gap={16}>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <SearchBox maxWidth={400} onChange={setSearch} value={search} />
        </div>
        <div style={{ width: 240 }}>
          <SelectLabel
            onChange={setStatusFilter}
            optionLabel="label"
            optionValue="value"
            options={STATUS_OPTIONEN}
            value={statusFilter}
          />
        </div>
        {filterAktiv && <Button label="Filter zurücksetzen" mode="tertiary" onClick={resetFilter} size="small" />}
      </Row>
      <DividerBlock height={1} />
      <RechnungTable rechnungen={gefiltert || []} />
    </div>
  );
}
