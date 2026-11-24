'use client';

import DividerBlock from '@/app/components/DividerBlock';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useMemo, useState } from 'react';
import SkeletonGrid from '../../components/ui/loading/SkeletonGrid';
import Grid from '@/app/components/layout/Grid';
import DashboardContainer from '@/app/components/layout/DashboardContainer';
import LineChart from '@/app/components/charts/LineChart';
import { fetchInvoicesByTeam } from '@/app/actions/documents/rechnungen';
import { Rechnung } from '@/app/types/rechnung/Rechnungen';
import { rechnungenProMonat, rechnungsKennzahlen } from '@/app/utils/rechnungen/chart';
import { formatCurrency } from '@/app/utils/formats';
import Row from '@/app/components/layout/Row';
import StatCard from '@/app/components/cards/StatCard';
import { CircleCheck, Clock, Euro } from 'lucide-react';

export default function Finanzen() {
    const { team, userProfile } = useAuth();

    // STATES
    const [loading, setLoading] = useState(true);

    // DATA
    const [rechnungen, setRechnungen] = useState<Rechnung[]>([]);

    // INIT
    useEffect(() => {
        if (!userProfile || !team?.id) return;
        const fetchData = async () => {
            const res = await fetchInvoicesByTeam(team.id);
            setRechnungen(res ?? []);
            setLoading(false);
        };
        fetchData();
    }, [userProfile, team?.id]);

    // ZAHLEN
    const kennzahlen = useMemo(() => rechnungsKennzahlen(rechnungen), [rechnungen]);
    const umsatzSerien = useMemo(() => rechnungenProMonat(rechnungen, 12), [rechnungen]);

    if (loading || !userProfile) return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <div className="row space-between">
                <h1>Finanzen</h1>
            </div>
            <DividerBlock height={2} />
            <SkeletonGrid columns="1fr 1fr 1fr 1fr" count={8} gap={16} height="140px" width="100%" />
        </div>
    );

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <div className="row space-between">
                <h1>Finanzen</h1>
            </div>
            <DividerBlock height={2} />
            <Row gap={16}>
                <StatCard
                    header={`Alle Rechnungen (${kennzahlen?.jahr ?? 0})`}
                    icon={Euro}
                    mode="currency"
                    value={kennzahlen?.bezahltJahr ?? 0}
                />
                <StatCard
                    header={`Rechnungen versendet`}
                    icon={CircleCheck}
                    value={kennzahlen?.anzahlJahr ?? 0}
                />
                <StatCard
                    header={`Offene Rechnungen`}
                    icon={Clock}
                    mode="currency"
                    value={kennzahlen?.offenSumme ?? 0}
                />
            </Row>
                        <DividerBlock height={1} />
            <Grid columns={1} gap={16}>
                <DashboardContainer header="Umsatz">
                    <LineChart height={280} series={umsatzSerien} yFormatter={formatCurrency} />
                </DashboardContainer>
            </Grid>
        </div>
    );
}