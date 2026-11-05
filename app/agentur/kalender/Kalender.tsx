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
import { fetchVorgaengeAgency } from '@/app/actions/agency/agencyVorgang';
import { Vorgang } from '@/app/types/vorgang';
import VorgangKalender from '@/app/components/kalender/VorgangKalender';

interface Props {

}

export default function Kalender() {
    const { userProfile } = useAuth();

    // DATA
    const [clients, setClients] = useState<User[]>([]);
    const [vorgaenge, setVorgaenge] = useState<Vorgang[]>([]);

    // INIT
    useEffect(() => {
        if (!userProfile) return;
        const fetchData = async () => {
            const res = await fetchVorgaengeAgency(userProfile.id);
            setClients(res.mandanten);
            setVorgaenge(res.vorgaenge)
        }
        fetchData();
    }, [userProfile])

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Kalender</h1>
                <div style={{ height: 30, width: 1 }} />
            </Row>
            <DividerBlock height={2} />
            <VorgangKalender users={clients} vorgaenge={vorgaenge} />
        </div>
    )
}