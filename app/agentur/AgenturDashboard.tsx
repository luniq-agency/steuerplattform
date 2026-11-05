"use client"

import { useEffect, useMemo, useState } from "react";
import DividerBlock from "../components/DividerBlock";
import DashboardContainer from "../components/layout/DashboardContainer";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/Database";
import { fetchClientsForAgent } from "../actions/agency/mandanten";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Grid from "../components/layout/Grid";
import StatCard from "../components/cards/StatCard";
import { fehlendeStammdaten } from "../utils/stammdaten";
import { useRouter } from "next/navigation";
import { fetchVorgaengeAgency } from "../actions/agency/agencyVorgang";
import { Vorgang } from "../types/vorgang";
import VorgangTable from "../components/vorgang/VorgangTable";

type MandantMitStatus = User & { fehlend: string[] };

export default function AgenturDashboard() {
    const { userProfile } = useAuth();

    const router = useRouter();

    // DATA
    const [clients, setClients] = useState<User[]>([]);
    const [tickets, setTickets] = useState<Vorgang[]>([]);

    // INIT
    useEffect(() => {
        if (!userProfile) return;
        const fetchData = async () => {
            const [ticketRes] = await Promise.all([
                fetchVorgaengeAgency(userProfile?.id)
            ])
            setClients(ticketRes.mandanten);
            setTickets(ticketRes.vorgaenge);
        }
        fetchData();
    }, [userProfile])

    const mitStatus = useMemo<MandantMitStatus[]>(
        () => clients.map((c) => ({ ...c, fehlend: fehlendeStammdaten(c) })),
        [clients]
    );

    // FILTER
    const incomplete = mitStatus
        .filter((c) => c.fehlend.length > 0)
        .sort((a, b) => b.fehlend.length - a.fehlend.length); // am meisten offen zuerst
    const complete = mitStatus.filter((c) => c.fehlend.length === 0);

    // TICKETS
    const completed = tickets.filter((t) => t.status == 'ready');
    const open = tickets.filter((t) => t.status == 'offen' || t.status == 'neu');

    // TEMPLATE
    const fehltTemplate = (c: MandantMitStatus) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <span
                key={c.id}
                style={{
                    background: '#fdeaea',
                    color: '#b42318',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                }}
            >
                Stammdaten
            </span>
        </div>
    );

    const nameTemplate = (c: MandantMitStatus) => <span>{c.nachname || '–'}, {c.vorname || '–'}</span>;

    const statusTemplate = (c: MandantMitStatus) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <span
                key={c.id}
                style={{
                    background: '#e9f7e5',
                    color: '#107b1b',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 8px',
                    whiteSpace: 'nowrap',
                }}
            >
                Bereit
            </span>
        </div>
    )

    // ACTIONS
    const oeffnen = (c: MandantMitStatus) => router.push(`/agentur/mandanten/${c.id}`);

    return (
        <div className="page-content" style={{ padding: 16 }}>
            <h1>Dashboard</h1>
            <DividerBlock height={1} />
            <Grid columns={3} gap={16}>
                <StatCard header="Mandanten im Bestand" value={clients.length} />
                <StatCard header="Offene Vorgänge" value={incomplete.length} />
                <StatCard header="Abgeschlossene Vorgänge" value={complete.length} />
            </Grid>
            <DividerBlock height={1} />
            <Grid columns={2} gap={16} grow>
                <DashboardContainer>
                    <h2>Daten vervollständigen</h2>
                    <DividerBlock height={1} />
                    <DataTable
                        emptyMessage="Alle Mandanten sind vollständig."
                        onRowClick={(e) => oeffnen(e.data as MandantMitStatus)}
                        rowHover
                        value={incomplete}
                    >
                        <Column body={nameTemplate} header="Mandant" style={{ width: "70%" }} />
                        <Column body={fehltTemplate} header="Was fehlt?" />
                    </DataTable>
                </DashboardContainer>
                <DashboardContainer>
                    <h2>Bereit zur Übergabe</h2>
                    <DividerBlock height={1} />
                    <DataTable value={complete}>
                        <Column body={nameTemplate} header="Mandant" style={{ width: "70%" }} />
                        <Column body={statusTemplate} field="" header="" />
                    </DataTable>
                </DashboardContainer>
                <DashboardContainer>
                    <h2>Offene Vorgänge</h2>
                    <DividerBlock height={1} />
                    <VorgangTable mode="short" users={clients} vorgaenge={open} />
                </DashboardContainer>
                <DashboardContainer>
                    <h2>Abgeschlossene Vorgänge</h2>
                    <DividerBlock height={1} />
                    <VorgangTable mode="short" users={clients} vorgaenge={completed} />
                </DashboardContainer>
            </Grid>
        </div>
    )
}