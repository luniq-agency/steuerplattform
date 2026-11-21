import { ticket_status } from "@/app/constants/Constants";
import { User } from "@/app/types/Database";
import { Vorgang } from "@/app/types/vorgang";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Tag from "../tag/Tag";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import Row from "../layout/Row";

interface Props {
    mode?: 'short' | 'detailed';
    role?: string;
    users: User[];
    vorgaenge: Vorgang[];
}

const WARN_DAYS = 7;

const formatDeadline = (date: Date) => {
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return date
        .toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            ...(sameYear ? {} : { year: 'numeric' }),
        })
        .replace('.', '. ')         
        .replace(/\.\s*$/, '')      
        .replace(/\s+/g, ' ')
        .trim();      
};

export default function VorgangTable({ mode = 'detailed', role = 'agentur', users, vorgaenge }: Props) {
    const router = useRouter();

    // TEMPLATES
    const deadlineTemplate = (rowData: Vorgang) => {
        if (!rowData.due_date) return <span className="deadline deadline--empty">–</span>;

        const date = new Date(rowData.due_date);
        if (isNaN(date.getTime())) return <span className="deadline deadline--empty">–</span>;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysLeft = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
        const urgent = daysLeft <= WARN_DAYS;

        return (
            <span
                className={`deadline ${urgent ? 'deadline--urgent' : ''}`}
                title={date.toLocaleDateString('de-DE')}
            >
                {formatDeadline(date)}
            </span>
        );
    };

    const nameTemplate = (rowData: Vorgang) => {
        const user = users.find((u) => u.id == rowData.user);
        if (!user) return <span>–</span>;
        return <span>{user.nachname}, {user.vorname}</span>
    }

    const statusTemplate = (rowData: Vorgang) => {
        const status = ticket_status.find((t) => t.value == rowData.status);
        if (!status) return null;
        return <Tag label={status.label} />;
    };

    const userTemplate = (rowData: Vorgang) => {
        const user = users.find((u) => u.id == rowData.user);
        if (!user) return <span>–</span>;
        const missing = !user.setup_complete;
        return (<Row alignItems="center" gap={4}>{missing && <TriangleAlert color="red" size={14} />} <span>{rowData.titel} </span></Row>);
    };

    const deadlineColumn = (
        <Column
            body={deadlineTemplate}
            field="deadline"
            header="Fällig bis"
            sortable
            align="right"
            alignHeader="right"
        />
    );

    // ACTIONS
    const select = (v: Vorgang) => {
        router.push(`/${role}/vorgaenge/${v.id}`)
    }

    if (mode === 'short') return (
        <DataTable onRowClick={(v) => select(v.data as Vorgang)} rows={10} value={vorgaenge}>
            <Column field="titel" header="Vorgang" style={{ width: "40%" }} />
            <Column body={userTemplate} header="Mandant" />
            {deadlineColumn}
        </DataTable>
    );

    return (
        <DataTable onRowClick={(v) => select(v.data as Vorgang)} value={vorgaenge}>
            <Column body={nameTemplate} header="Vorgang" style={{ width: "40%" }} />
            <Column body={userTemplate} header="Mandant" />
            <Column body={statusTemplate} field="status" header="Status" />
            {deadlineColumn}
        </DataTable>
    );
}