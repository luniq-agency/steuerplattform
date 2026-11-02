'use client';

import { createClient } from '@/app/utils/supabase/client';
import DividerBlock from '@/app/components/DividerBlock';
import LinkBlock from '@/app/components/cards/LinkBlock';
import { useAuth } from '@/app/context/AuthContext';
import Loader from '@/app/components/Loader';
import { useEffect, useRef, useState } from 'react';
import Grid from '../components/layout/Grid';
import StatCard from '../components/cards/StatCard';
import { Euro, Plus } from 'lucide-react';
import Row from '../components/layout/Row';
import DashboardContainer from '../components/layout/DashboardContainer';
import Button from '../components/buttons/Button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatCurrency, monatKey } from '../utils/formats';
import { fetchRechnungStatistik } from '../actions/stats/rechnungen';
import { Statistik } from '../types/stats';
import { AusgabeStatistik, fetchAusgabeStatistik } from '../actions/stats/ausgaben';
import { Vorgang } from '../types/vorgang';
import { fetchVorgaengeByClient } from '../actions/vorgang/vorgang';

export default function Dashboard() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { team, user, userProfile } = useAuth();

  // STATES
  const [statsLoading, setStatsLoading] = useState(false);

  // DATA
  const [ausgaben, setAusgaben] = useState<AusgabeStatistik | null>(null);
  const [stats, setStats] = useState<Statistik | null>(null);
  const [tickets, setTickets] = useState<Vorgang[]>([]);

  useEffect(() => {
    if (userProfile || !user) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(async () => {
      const supabase = createClient();
      const { data } = await supabase.from('user').select('user_id').eq('user_id', user.id).maybeSingle();

      if (data) {
        clearInterval(intervalRef.current!);
        window.location.reload();
      }
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, userProfile]);

  useEffect(() => {
    if (!team || !userProfile) return;

    const load = async () => {
      setStatsLoading(true);
      const monat = monatKey(new Date());
      const [rechnungen, ausgaben, vorgänge] = await Promise.all([
        fetchRechnungStatistik(team.id, monat),
        fetchAusgabeStatistik(team.id, monat),
        fetchVorgaengeByClient(userProfile.id),
      ]);
      setStats(rechnungen);
      setAusgaben(ausgaben);
      setTickets(vorgänge);
      setStatsLoading(false);
    };
    load();
  }, [team]);

  // CALCULATIONS
  const raw = (stats?.gesamt_summe || 0) - (ausgaben?.gesamt_summe || 0);

  if (!user || !userProfile) return null;

  return (
    <div className="content-wrapper" style={{ padding: 16 }}>
      <Row alignItems='center' justifyContent='space-between'>
        <h1>Hallo, {userProfile?.vorname}!</h1>
      </Row>
      <DividerBlock height={1} />
      <Grid columns={3} gap={16}>
        <StatCard
          header={`Einnahmen (${stats?.bezahlt_anzahl ?? 0})`}
          icon={Euro}
          mode="currency"
          value={stats?.bezahlt_summe ?? 0}
        />
        <StatCard
          header={`Ausgaben (${ausgaben?.gesamt_anzahl ?? 0})`}
          icon={Euro}
          mode="currency"
          value={ausgaben?.gesamt_summe ?? 0}
        />
        <StatCard
          header={`Umsatz (vor Steuern)`}
          icon={Euro}
          mode="currency"
          value={raw ?? 0}
        />
      </Grid>
      <DividerBlock height={1} />
      <Grid columns={2}>
        <DashboardContainer>
          <Row alignItems='center' justifyContent='space-between'>
            <h2>Meine Vorgänge</h2>
            <Button icon={Plus} label="Neuer Vorgang" mode="tertiary" size="small" />
          </Row>
          <DividerBlock height={1.5} />
          <DataTable value={tickets}>
            <Column field="titel" header="Name" />
            <Column header="Status" />
          </DataTable>
        </DashboardContainer>
        <DashboardContainer>
          <h2>Meine Vorgänge</h2>
        </DashboardContainer>
      </Grid>
    </div>
  );
}
