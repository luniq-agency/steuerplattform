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
import { invoice_status, job_categories } from '@/app/constants/Constants';
import StatusTag from '@/app/components/status/StatusTag';
import { useRouter } from 'next/navigation';
import { Kunde } from '@/app/types/clients';
import { fetchKundenByTeam } from '@/app/actions/kunden';
import { LAENDER_SORTIERT } from '@/app/constants/countries';
import { fetchClientsForAgent } from '@/app/actions/agency/mandanten';
import { User } from '@/app/types/Database';

export default function Mandanten() {
    const { team, userProfile } = useAuth();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);

    // STATES
    const [loading, setLoading] = useState(true);

    // DATA
    const [kunden, setKunden] = useState<User[]>([]);

    // INIT: Rechnungen laden
    useEffect(() => {
        if (!userProfile) return;
        const fetchData = async () => {
            setLoading(true);
            const res = await fetchClientsForAgent(userProfile.id);
            setKunden(res);
            setLoading(false);
        };
        fetchData();
    }, [team]);

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
                        <SkeletonGrid columns="1fr 1fr 1fr" count={3} gap={16} height="72.5px" width="100%" />
                                  <DividerBlock height={2} />
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
            </Row>
            <DividerBlock height={2} />
            <DataTable onRowClick={(e) => selectClient(e.data as User)} value={kunden} emptyMessage="Du hast noch keine Mandanten angelegt.">
                <Column body={nameTemplate} header="Name" sortable sortField='name' />
                <Column body={jobTemplate} header="Berufsstatus" />
                <Column field="beruf" header="Beruf" />
                <Column body={(rowData) => formatDate(rowData.created_at)} header="Registriert seit" />
            </DataTable>
        </div>
    );
}