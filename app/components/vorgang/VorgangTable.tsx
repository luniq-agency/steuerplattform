import { ticket_status } from "@/app/constants/Constants";
import { User } from "@/app/types/Database";
import { Vorgang } from "@/app/types/vorgang";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Tag from "../tag/Tag";
import { useRouter } from "next/navigation";

interface Props {
    mode?: 'short' | 'detailed';
    users: User[];
    vorgaenge: Vorgang[];
}

const WARN_DAYS = 7; // ab wie vielen Tagen vor Fälligkeit rot

const formatDeadline = (date: Date) => {
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return date
        .toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            ...(sameYear ? {} : { year: 'numeric' }),
        })
        .replace('.', '. ')          // "10.Jan." -> "10. Jan."
        .replace(/\.\s*$/, '')       // abschließenden Punkt entfernen
        .replace(/\s+/g, ' ')
        .trim();                     // -> "10. Jan" bzw. "10. Jan 2027"
};

export default function VorgangTable({ mode = 'detailed', users, vorgaenge }: Props) {
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

    const statusTemplate = (rowData: Vorgang) => {
        const status = ticket_status.find((t) => t.value == rowData.status);
        if (!status) return null;
        return <Tag label={status.label} />;
    };

    const userTemplate = (rowData: Vorgang) => {
        const user = users.find((u) => u.id == rowData.user);
        if (!user) return <span>–</span>;
        return <span>{user.nachname}, {user.vorname}</span>;
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
        router.push(`/agentur/vorgaenge/${v.id}`)
    }

    if (mode === 'short') return (
        <DataTable onRowClick={(v) => select(v.data as Vorgang)} value={vorgaenge}>
            <Column field="titel" header="Vorgang" style={{ width: "40%" }} />
            <Column body={userTemplate} header="Mandant" />
            {deadlineColumn}
        </DataTable>
    );

    return (
        <DataTable onRowClick={(v) => select(v.data as Vorgang)} value={vorgaenge}>
            <Column field="titel" header="Vorgang" style={{ width: "40%" }} />
            <Column body={userTemplate} header="Mandant" />
            <Column body={statusTemplate} field="status" header="Status" />
            {deadlineColumn}
        </DataTable>
    );
}