"use client"

import { fetchAbos } from "@/app/actions/finance/abos";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import Row from "@/app/components/layout/Row";
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


    return (
        <div className="page-content">
            <Row alignItems="center" justifyContent='space-between'>
                <h1>Abonnements</h1>
                <Link href="/admin/abonnements/neu">
                    <Button icon={Plus} label="Neues Abo" mode="secondary" size="small" />
                </Link>
            </Row>
            <DividerBlock height={2} />
            <DataTable onRowClick={(e) => selectAbo(e.data as Abonnement)} rows={15} stripedRows value={abos}>
                <Column field="bezeichnung" header="Bezeichnung" />
                <Column body={clientTemplate} header="Kunde" />
                <Column body={(rowData) => formatCurrency(rowData.betrag_brutto || 0)} header="Betrag" />
                <Column body={(rowData) => formatDate(rowData.startdatum)} header="Startdatum" />
            </DataTable>
        </div>
    )
}