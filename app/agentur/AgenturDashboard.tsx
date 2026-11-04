"use client"

import { useEffect, useState } from "react";
import DividerBlock from "../components/DividerBlock";
import DashboardContainer from "../components/layout/DashboardContainer";
import { useAuth } from "../context/AuthContext";
import { User } from "../types/Database";
import { fetchClientsForAgent } from "../actions/agency/mandanten";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Grid from "../components/layout/Grid";
import StatCard from "../components/cards/StatCard";



export default function AgenturDashboard() {
    const { userProfile } = useAuth();

    // DATA
    const [clients, setClients] = useState<User[]>([]);

    // INIT
    useEffect(() => {
        if (!userProfile) return;
        const fetchData = async () => {
            const res = await fetchClientsForAgent(userProfile.id);
            setClients(res)
        }
        fetchData();
    }, [userProfile])

    // FILTER
    const complete = clients.filter((c) => c.onboarding_complete == true);
    const incomplete = clients.filter((c) => c.onboarding_complete == false || !c.onboarding_complete);

    return (
        <div className="page-content" style={{padding:16}}>
            <h1>Dashboard</h1>
            <DividerBlock height={1} />
            <Grid columns={3} gap={16}>
                <StatCard header="Mandanten im Bestand" value={clients.length} />
                <StatCard header="Unvollständig" value={incomplete.length} />
                <StatCard header="Bereit zur Übergabe" value={complete.length} />
            </Grid>
            <DividerBlock height={1} />
            <Grid columns={2} gap={16}>
                <DashboardContainer>
                    <h2>Daten vervollständigen</h2>
                    <DividerBlock height={1} />
                    <DataTable value={incomplete}>
                        <Column body={(rowData) => <span>{rowData.nachname}, {rowData.vorname}</span>} header="Mandant" />
                        <Column field="" header="Was fehlt?" />
                    </DataTable>
                </DashboardContainer>
                <DashboardContainer>
                    <h2>Bereit zur Übergabe</h2>
                    <DividerBlock height={1} />
                    <DataTable value={complete}>
                        <Column body={(rowData) => <span>{rowData.nachname}, {rowData.vorname}</span>} header="Mandant" />
                        <Column field="" header="" />
                    </DataTable>
                </DashboardContainer>
            </Grid>
        </div>
    )
}