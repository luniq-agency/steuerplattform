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
import { formatDate } from '@/app/utils/formats';
import StatCard from '@/app/components/cards/StatCard';
import { createClient } from '@/app/utils/supabase/client';
import { job_categories } from '@/app/constants/Constants';
import StatusTag from '@/app/components/status/StatusTag';
import { useRouter } from 'next/navigation';
import { fetchClientsForAgent } from '@/app/actions/agency/mandanten';
import { User } from '@/app/types/Database';

type Zeitraum = 'alle' | 'woche' | 'monat';

const ZEITRAUM_OPTIONEN = [
    { label: 'Alle Mandanten', value: 'alle' },
    { label: 'Neu diese Woche', value: 'woche' },
    { label: 'Neu diesen Monat', value: 'monat' },
];

// Montag 00:00 der aktuellen Woche
const wochenStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d;
};

// 1. des aktuellen Monats, 00:00
const monatsStart = () => {
    const heute = new Date();
    return new Date(heute.getFullYear(), heute.getMonth(), 1);
};

const seit = (k: User, start: Date) => !!k.created_at && new Date(k.created_at) >= start;

export default function Mandanten() {
    const { userProfile } = useAuth();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    // DATA
    const [kunden, setKunden] = useState<User[]>([]);

    // STATES
    const [loading, setLoading] = useState(true);
    const [zeitraum, setZeitraum] = useState<Zeitraum>('alle');

    const neuWoche = useMemo(() => kunden.filter((k) => seit(k, wochenStart())), [kunden]);
    const neuMonat = useMemo(() => kunden.filter((k) => seit(k, monatsStart())), [kunden]);

    const angezeigt = zeitraum === 'woche' ? neuWoche : zeitraum === 'monat' ? neuMonat : kunden;

    // INIT: Rechnungen laden
    useEffect(() => {
        if (!userProfile) return;
        const fetchData = async () => {
            const res = await fetchClientsForAgent(userProfile.id);
            setKunden(res);
            setLoading(false);
        };
        fetchData();
    }, [userProfile]);

    // TEMPLATES
    const jobTemplate = (rowData: User) => {
        const job = job_categories.find((l) => l.value === rowData.berufsstatus)
        return <StatusTag bg={job?.bg || 'blue'} color={job?.color || 'white'} label={job?.label || '–'} />
    }

    const nameTemplate = (rowData: User) => {
        const formatted = `${rowData.nachname}, ${rowData.vorname}`
        return <span>{formatted}</span>
    }

    // ACTIONS
    const selectClient = (rowData: User) => {
        router.push(`/agentur/mandanten/${rowData.id}`);
    };

    if (loading || !userProfile) return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Mandanten</h1>
                <Row alignItems="center" gap={8} width="fit-content">
                    <Link href="/agentur/mandanten/neu">
                        <Button icon={Plus} label="Neuer Mandant" mode="secondary" size="small" />
                    </Link>
                </Row>
            </Row>
            <DividerBlock height={2} />
            <SkeletonGrid columns="1fr 1fr 1fr" count={3} gap={16} height="94.73px" width="100%" />
            <DividerBlock height={1} />
            <SkeletonGrid columns="1fr" count={1} gap={16} height="72.5px" width="100%" />
        </div>
    );

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Mandanten</h1>
                <Row alignItems="center" gap={8} width="fit-content">
                    <Link href="/agentur/mandanten/neu">
                        <Button icon={Plus} label="Neuer Mandant" mode="secondary" size="small" />
                    </Link>
                </Row>
            </Row>
            <DividerBlock height={2} />
            <Row gap={16}>
                <StatCard header="Mandanten im Bestand" icon={CircleCheck} value={kunden.length} />
                <StatCard header="Neu diese Woche" icon={CircleCheck} value={neuWoche.length} />
                <StatCard header="Neu diesen Monat" icon={CircleCheck} value={neuMonat.length} />
            </Row>
            <DividerBlock height={1} />
            <DataTable onRowClick={(e) => selectClient(e.data as User)} value={kunden} emptyMessage="Du hast noch keine Mandanten angelegt.">
                <Column body={nameTemplate} header="Name" sortable sortField='name' />
                <Column body={jobTemplate} header="Berufsstatus" />
                <Column field="beruf" header="Beruf" />
                <Column body={(rowData) => formatDate(rowData.created_at)} header="Registriert seit" />
            </DataTable>
        </div>
    );
}