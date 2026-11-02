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

type Statistik = {
  gesamt_anzahl: number;
  gesamt_summe: number;
  bezahlt_anzahl: number;
  bezahlt_summe: number;
  offen_anzahl: number;
  offen_summe: number;
};

// 'YYYY-MM' für Vergleiche, 'YYYY-MM-01' für die Datenbank
const monatKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export default function Rechnungen() {
  const { team, userProfile } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // STATES
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  // INPUTS
  const [monat, setMonat] = useState<Date>(new Date());

  // DATA
  const [rechnungen, setRechnungen] = useState<Rechnung[]>([]);
  const [stats, setStats] = useState<Statistik | null>(null);

  // INIT: Rechnungen laden
  useEffect(() => {
    if (!team) return;
    const fetchData = async () => {
      setLoading(true);
      const res = await fetchInvoicesByTeam(team.id);
      setRechnungen(res);
      setLoading(false);
    };
    fetchData();
  }, [team]);

  // Statistik für gewählten Monat laden
  useEffect(() => {
    if (!team) return;
    const fetchStats = async () => {
      setStatsLoading(true);
      const { data, error } = await supabase
        .rpc('rechnung_statistik', {
          p_team_id: team.id,
          p_monat: `${monatKey(monat)}-01`,
        })
        .single();

      if (error) console.error('Statistik konnte nicht geladen werden:', error);
      setStats((data as Statistik) ?? null);
      setStatsLoading(false);
    };
    fetchStats();
  }, [team, monat, supabase]);

  // Tabelle auf den gewählten Monat filtern
  const rechnungenImMonat = useMemo(
    () =>
      rechnungen.filter((r) => {
        if (!r.rechnungsdatum) return false;
        const datum = r.rechnungsdatum as Date | string;
        const key = typeof datum === 'string' ? datum.slice(0, 7) : monatKey(datum);
        return key === monatKey(monat);
      }),
    [rechnungen, monat]
  );

  // TEMPLATES
  const statusTemplate = (rowData: Rechnung) => {
    const status = invoice_status.find((i) => i.value == rowData.status);
    if (!status) return <span>–</span>
    return (
      <StatusTag bg={status.bg || 'blue'} color={status.color || 'white'} label={status?.label} />
    )
  }

  // ACTIONS
  const selectInvoice = (rowData: Rechnung) => {
    router.push(`/dashboard/rechnungen/${rowData.id}`);
  };

  if (loading || !userProfile) return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Row alignItems="center" justifyContent="space-between">
        <h1>Rechnungen</h1>
        <Row alignItems="center" gap={8} width="fit-content">
          <SkeletonGrid columns="1fr" count={1} gap={16} height="36px" width="185px" />
          <Link href="/dashboard/rechnungen/neu">
            <Button icon={Plus} label="Neue Rechnung" mode="secondary" size="small" />
          </Link>
        </Row>
      </Row>
      <DividerBlock height={2} />
      <SkeletonGrid columns="1fr 1fr 1fr" count={3} gap={16} height="94.73px" width="100%" />
    </div>
  );

  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Row alignItems="center" justifyContent="space-between">
        <h1>Rechnungen</h1>
        <Row alignItems="center" gap={8} width="fit-content">
          <Calendar
            dateFormat="MM yy"
            locale="de"
            onChange={(e) => e.value && setMonat(e.value as Date)}
            value={monat}
            view="month"
          />
          <Link href="/dashboard/rechnungen/neu">
            <Button icon={Plus} label="Neue Rechnung" mode="secondary" size="small" />
          </Link>
        </Row>
      </Row>
      <DividerBlock height={2} />
      <Row gap={16} style={{ opacity: statsLoading ? 0.5 : 1 }}>
        <StatCard
          header={`Alle Rechnungen (${stats?.gesamt_anzahl ?? 0})`}
          icon={Euro}
          mode="currency"
          value={stats?.gesamt_summe ?? 0}
        />
        <StatCard
          header={`Bezahlt (${stats?.bezahlt_anzahl ?? 0})`}
          icon={CircleCheck}
          mode="currency"
          value={stats?.bezahlt_summe ?? 0}
        />
        <StatCard
          header={`Offen (${stats?.offen_anzahl ?? 0})`}
          icon={Clock}
          mode="currency"
          value={stats?.offen_summe ?? 0}
        />
      </Row>
      <DividerBlock height={2} />

      <DataTable onRowClick={(e) => selectInvoice(e.data as Rechnung)} value={rechnungenImMonat} emptyMessage="Keine Rechnungen in diesem Monat.">
        <Column field="rechnungsnummer" header="#" />
        <Column field="empfaenger" header="Empfänger" />
        <Column body={(rowData: Rechnung) => formatCurrency(rowData.betrag_gesamt)} header="Betrag" />
        <Column body={(rowData: Rechnung) => formatDate(rowData.rechnungsdatum)} header="Datum" />
        <Column body={statusTemplate} header="Status" />
      </DataTable>
    </div>
  );
}