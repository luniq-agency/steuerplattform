"use client"

import { job_categories } from "@/app/constants/Constants";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import StatusTag from "../status/StatusTag";
import { User } from "@/app/types/Database";
import { formatDate } from "@/app/utils/formats";
import { useRouter } from "next/navigation";

interface Props {
    agent: User;
    clients: User[];
    mode?: 'admin' | 'agency'
}
export default function AgencyClientTable({ agent, clients, mode = 'agency' }: Props) {
    const router = useRouter();

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
    const select = (u: User) => {
        const path = mode == 'admin' ? `/admin/kunden/${u.id}` : `/agentur/mandanten/${u.id}`;
        router.push(path)
    }

    // TEXT
    const emptyMessage = mode == 'admin' ? 'Der Agenturist hat noch keine Mandanten angelegt.' : 'Du hast noch keine Mandanten angelegt.'

    return (
        <DataTable value={clients} emptyMessage={emptyMessage} onRowClick={(v) => select(v.data as User)} paginator rows={12} sortField="nachname" sortOrder={1} stripedRows>
            <Column body={nameTemplate} header="Name" sortable sortField='name' style={{ width: "25%" }} />
            <Column body={jobTemplate} header="Berufsstatus" />
            <Column field="beruf" header="Beruf" />
            <Column body={(rowData) => formatDate(rowData.created_at)} header="Registriert seit" />
        </DataTable>
    )

}