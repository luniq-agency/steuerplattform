"use client"

import { fetchAbos } from "@/app/actions/finance/abos";
import Button from "@/app/components/buttons/Button";
import StatCard from "@/app/components/cards/StatCard";
import DividerBlock from "@/app/components/DividerBlock";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import Tag from "@/app/components/tag/Tag";
import { invoice_status } from "@/app/constants/Constants";
import { abo_status } from "@/app/constants/status/invoices";
import { Abonnement } from "@/app/types/abos";
import { User } from "@/app/types/Database";
import { formatCurrency, formatDate } from "@/app/utils/formats";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";

interface Props {
    clients: User[];
}
export default function Abonnements({ clients }: Props) {
    const router = useRouter();

    // DATA
    const [abos, setAbos] = useState<Abonnement[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetchAbos()
            setAbos(res);
        }
        fetchData();
    }, [])

    // ACTIONS
    const selectAbo = (a: Abonnement) => {
        router.push(`/admin/abonnements/${a.id}`);
    }

    // TEMPLATES
    const clientTemplate = (rowData: Abonnement) => {
        const user = clients.find((c) => c.id == rowData.mandant);
        if (!user) return <span>–</span>
        return <span>{user.nachname}, {user.vorname}</span>
    }

    const statusTemplate = (rowData: Abonnement) => {
        const status = abo_status.find((c) => c.value == rowData.status);
        if (!status) return <span>–</span>
        return <Tag label={status.label} />
    }


    // CALC
    const total = abos.reduce((sum, d) => sum + (d.betrag_brutto ?? 0), 0);

    return (
        <div className="page-content">
            <Row alignItems="center" justifyContent='space-between'>
                <h1>Abonnements</h1>
                <Link href="/admin/abonnements/neu">
                    <Button icon={Plus} label="Neues Abo" mode="secondary" size="small" />
                </Link>
            </Row>
            <DividerBlock height={1} />
            <Grid columns={3}>
                <StatCard header="Monatliches Einkommen" mode="currency" value={total} />
                <StatCard header="Aktive Abonnements" value={abos.length} />
            </Grid>
            <DividerBlock height={1} />
            <DataTable onRowClick={(e) => selectAbo(e.data as Abonnement)} rows={15} stripedRows value={abos}>
                <Column field="bezeichnung" header="Bezeichnung" />
                <Column body={clientTemplate} header="Kunde" />
                <Column body={(rowData) => formatCurrency(rowData.betrag_brutto || 0)} header="Betrag" />
                <Column body={statusTemplate} header="Status" />
                <Column body={(rowData) => formatDate(rowData.startdatum)} header="Startdatum" />
            </DataTable>
        </div>
    )
}