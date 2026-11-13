import { Rechnung } from "@/app/types/rechnung/Rechnungen";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatCurrency, formatDate } from "@/app/utils/formats";
import { invoice_status } from "@/app/constants/Constants";
import StatusTag from "../status/StatusTag";
import { useRouter } from "next/navigation";


interface Props {
    rechnungen: Rechnung[];
}

export default function RechnungTable({ rechnungen }: Props) {
    const router = useRouter();

    // TEMPLATES
    const statusTemplate = (rowData: Rechnung) => {
        const status = invoice_status.find((i) => i.value == rowData.status);
        if (!status) return <span>–</span>
        return (
            <StatusTag bg={status.bg || 'blue'} color={status.color || 'white'} label={status?.label} />
        )
    }

    // ACTIONS
    const selectInvoice = (rowData: Rechnung) => {
        router.push(`/dashboard/rechnungen/${rowData.id}`);
    };

    return (
        <DataTable onRowClick={(e) => selectInvoice(e.data as Rechnung)} value={rechnungen} emptyMessage="Keine Rechnungen in diesem Monat.">
            <Column field="rechnungsnummer" header="#" sortable sortField="rechnungsnummer" style={{ width: 150 }} />
            <Column field="empfaenger" header="Empfänger" />
            <Column body={(rowData: Rechnung) => formatCurrency(rowData.betrag_gesamt)} header="Betrag" sortable sortField="betrag_gesamt" style={{ width: 200 }} />
            <Column body={(rowData: Rechnung) => formatDate(rowData.rechnungsdatum)} header="Datum" sortable sortField="rechungsdatum" style={{ width: 200 }} />
            <Column body={(rowData: Rechnung) => formatDate(rowData.bezahlziel)} header="Zahlungsziel" sortable sortField="bezahlziel" style={{ width: 200 }} />
            <Column body={statusTemplate} header="Status" style={{ width: 200 }} />
        </DataTable>
    )
}