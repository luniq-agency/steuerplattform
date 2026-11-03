"use client"

import { fetchAbos } from "@/app/actions/finance/abos";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import Row from "@/app/components/layout/Row";
import { Abonnement } from "@/app/types/abos";
import { User } from "@/app/types/Database";
import { formatCurrency } from "@/app/utils/formats";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useEffect, useState } from "react";

interface Props {
    clients: User[];
}
export default function Abonnements({ clients }: Props) {

    // DATA
    const [abos, setAbos] = useState<Abonnement[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetchAbos()
            setAbos(res);
        }
        fetchData();
    }, [])

    // TEMPLATES


    return (
        <div className="page-content">
            <Row alignItems="center" justifyContent='space-between'>
                <h1>Abonnements</h1>
                <Link href="/admin/abonnements/neu">
                    <Button icon={Plus} label="Neues Abo" mode="secondary" size="small" />
                </Link>
            </Row>
            <DividerBlock height={2} />
            <DataTable rows={15} stripedRows value={abos}>
                <Column field="bezeichnung" header="Bezeichnung" />
                <Column body={(rowData) => formatCurrency(rowData.betrag_brutto || 0)} header="Kunde" />
                <Column body={(rowData) => formatCurrency(rowData.betrag_brutto || 0)} header="Betrag" />
            </DataTable>
        </div>
    )
}