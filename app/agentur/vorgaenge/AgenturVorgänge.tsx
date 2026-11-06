'use client';

import { ticketCreate, ticketEntryCreate, ticketsLoadUser } from '@/app/actions/tickets';
import { useAuth } from '@/app/context/AuthContext';
import { Ticket, User } from '@/app/types/Database';
import { formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useState } from 'react';
import DividerBlock from '@/app/components/DividerBlock';
import { ticket_status } from '@/app/constants/Constants';
import { useRouter } from 'next/navigation';
import { Tag } from 'primereact/tag';
import Link from 'next/link';
import Button from '@/app/components/buttons/Button';
import { Circle, CircleAlert, Plus } from 'lucide-react';
import Row from '@/app/components/layout/Row';
import { Vorgang } from '@/app/types/vorgang';
import { fetchVorgaengeAgency } from '@/app/actions/agency/agencyVorgang';
import StatCard from '@/app/components/cards/StatCard';

interface Props {
    onSubmit?: () => void;
}

export default function AgenturVorgänge({ onSubmit }: Props) {
    const { team, userProfile } = useAuth();
    const router = useRouter();

    // DATA
    const [mandanten, setMandanten] = useState<User[]>([]);
    const [tickets, setTickets] = useState<Vorgang[]>([]);

    useEffect(() => {
        if (!userProfile) return;
        const fetchDocs = async () => {
            try {
                const res = await fetchVorgaengeAgency(userProfile?.id);
                setMandanten(res.mandanten);
                setTickets(res.vorgaenge);
                console.log('Mandanten:', res.mandanten);
                console.log('Vorgänge:', res.vorgaenge)
            } catch (err) {
                console.error(err);
            }
        };

        fetchDocs();
    }, [userProfile]);

    const selectTicket = async (rowData: Vorgang) => {
        router.push(`/agentur/vorgaenge/${rowData.id}`);
    };

    // TEMPLATES
    const actionTemplate = (rowData: Vorgang) => {

    }

    const clientTemplate = (rowData: Vorgang) => {
        const mandant = mandanten.find((m) => m.id === rowData.user)
        return <span>{mandant?.nachname}, {mandant?.vorname}</span>
    }

    const statusTemplate = (rowData: Ticket) => {
        const statusObj = ticket_status.find((t) => t.value === rowData.status);
        return <Tag severity={(statusObj?.severity as any) ?? 'info'} value={statusObj?.label ?? ''} />;
    };

    // FILTER
    const completed = tickets.filter((t) => t.status === 'abgeschlossen');
    const open = tickets.filter((t) => t.status === 'offen' || t.status === 'neu');

    // ACTIONS

    return (
        <>
            <Row alignItems="center" justifyContent='space-between'>
                <h1>Meine Vorgänge</h1>
                <Link href="/agentur/vorgaenge/neu">
                    <Button
                        icon={Plus}
                        label="Vorgang erstellen"
                        mode="secondary"
                        size="small"
                    />
                </Link>
            </Row>
            <DividerBlock height={2} />
            <Row gap={16}>
                <StatCard header="Vorgänge insgesamt" icon={CircleAlert} value={tickets.length} />
                <StatCard header="Vorgänge offen" icon={CircleAlert} value={open.length} />
                <StatCard header="Vorgänge abgeschlossen" icon={CircleAlert} value={completed.length} />
            </Row>
            <DividerBlock height={2} />
            <DataTable
                emptyMessage="Du hast noch keine Vorgänge erstellt."
                paginator
                onRowClick={(e) => selectTicket(e.data as Vorgang)}
                rows={10}
                stripedRows
                value={tickets}
            >
                <Column field="titel" header="Name" />
                <Column body={clientTemplate} header="Mandant" />
                <Column body={(rowData) => formatDate(rowData.created_at)} header="Erstellt am" />
                <Column body={statusTemplate} header="Status" />
                <Column body={statusTemplate} header="" />
            </DataTable>
        </>
    );
}
