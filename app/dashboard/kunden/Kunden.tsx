'use client';

import DividerBlock from '@/app/components/DividerBlock';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import SkeletonGrid from '../../components/ui/loading/SkeletonGrid';
import Link from 'next/link';
import Button from '@/app/components/buttons/Button';
import { CircleCheck, Clock, Euro, Plus } from 'lucide-react';
import Row from '@/app/components/layout/Row';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Calendar } from 'primereact/calendar';
import { formatCurrency, formatDate } from '@/app/utils/formats';
import { Rechnung } from '@/app/types/rechnung/Rechnungen';
import { fetchInvoicesByTeam } from '@/app/actions/documents/rechnungen';
import StatCard from '@/app/components/cards/StatCard';
import { createClient } from '@/app/utils/supabase/client';
import { invoice_status } from '@/app/constants/Constants';
import StatusTag from '@/app/components/status/StatusTag';
import { useRouter } from 'next/navigation';
import { Kunde } from '@/app/types/clients';
import { fetchKundenByTeam } from '@/app/actions/kunden';
import { LAENDER_SORTIERT } from '@/app/constants/countries';

export default function Kunden() {
  const { team, userProfile } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // STATES
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  // INPUTS
  const [monat, setMonat] = useState<Date>(new Date());

  // DATA
  const [kunden, setKunden] = useState<Kunde[]>([]);

  // INIT: Rechnungen laden
  useEffect(() => {
    if (!team) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetchKundenByTeam(team.id);
      setKunden(res);
      setLoading(false);
    };
    fetchData();
  }, [team]);

  // TEMPLATES
  const addressTemplate = (rowData: Kunde) => {
    const formatted = `${rowData.plz} ${rowData.ort}`
    return <span>{formatted}</span>
  }

  const countryTemplate = (rowData: Kunde) => {
    const country = LAENDER_SORTIERT.find((l) => l.code === rowData.land)
    return <Row alignItems="center" gap={4}><img alt={country?.code} height={8} src={country?.flag || ''} width={12}/><span>{country?.name}</span></Row>
  }

  const statusTemplate = (rowData: Rechnung) => {
    const status = invoice_status.find((i) => i.value == rowData.status);
    if (!status) return <span>–</span>
    return (
      <StatusTag bg={status.bg || 'blue'} color={status.color || 'white'} label={status?.label} />
    )
  }

  // ACTIONS
  const selectClient = (rowData: Kunde) => {
    router.push(`/dashboard/kunden/${rowData.id}`);
  };

  if (loading || !userProfile) return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Row alignItems="center" justifyContent="space-between">
        <h1>Kunden</h1>
        <Row alignItems="center" gap={8} width="fit-content">
          <Link href="/dashboard/kunden/neu">
            <Button icon={Plus} label="Neuer Kunde" mode="secondary" size="small" />
          </Link>
        </Row>
      </Row>
      <DividerBlock height={2} />
      <SkeletonGrid columns="1fr" count={1} gap={16} height="72.5px" width="100%" />
    </div>
  );

  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Row alignItems="center" justifyContent="space-between">
        <h1>Kunden</h1>
        <Row alignItems="center" gap={8} width="fit-content">
          <Link href="/dashboard/kunden/neu">
            <Button icon={Plus} label="Neuer Kunde" mode="secondary" size="small" />
          </Link>
        </Row>
      </Row>
      <DividerBlock height={2} />
      <DataTable onRowClick={(e) => selectClient(e.data as Kunde)} value={kunden} emptyMessage="Bisher wurden noch keine Kunden angelegt.">
        <Column field="kundennummer" header="#" />
        <Column field="name" header="Name" sortable sortField='name'/>
        <Column body={addressTemplate} header="Anschrift" />
        <Column body={countryTemplate} header="Land" />
        <Column body={statusTemplate} header="Status" />
      </DataTable>
    </div>
  );
}