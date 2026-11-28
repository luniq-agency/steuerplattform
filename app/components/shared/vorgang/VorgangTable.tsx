import { User } from "@/app/types/Database";
import { Vorgang } from "@/app/types/vorgang"
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Row from "../../layout/Row";
import { useMemo, useState } from "react";
import { formatDate } from "@/app/utils/formats";
import DividerBlock from "../../DividerBlock";
import Button from "../../buttons/Button";
import { ticket_status } from "@/app/constants/Constants";
import { useRouter } from "next/navigation";
import Grid from "../../layout/Grid";
import { SelectLabel } from '@/app/components/inputs/Select';
import { TextInputLabel } from "../../forms/FormElements";
import Tag from "../../tag/Tag";

interface Props {
    header?: string;
    tasks: Vorgang[];
    users: User[];
}

const STATUS_OPTIONS = [{ label: 'Alle', value: '' }, ...ticket_status];

export default function VorgangTable({ header = 'Kunde', users, tasks }: Props) {
    const router = useRouter();

    // FILTER
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filterAktiv = !!search || !!statusFilter;

    const resetFilter = () => {
        setSearch('');
        setStatusFilter('');
    };

    const userName = (id: Vorgang['created_by']) => {
        const u = users.find((u) => u.id === id);
        return u ? `${u.vorname ?? ''} ${u.nachname ?? ''}`.trim() : '';
    };

    const filteredTasks = useMemo(() => {
        const begriff = search.trim().toLowerCase();

        return tasks.filter((t) => {
            if (statusFilter && t.status !== statusFilter) return false;
            if (!begriff) return true;

            return [t.titel, t.beschreibung, userName(t.created_by)]
                .filter(Boolean)
                .some((feld) => String(feld).toLowerCase().includes(begriff));
        });
    }, [tasks, users, search, statusFilter]);

    // TEMPLATES
    const clientTemplate = (rowData: Vorgang) => {
        const id = rowData.user ? rowData.user : rowData.created_by;
        const user = users.find((u) => u.id == id);
        return <span>{user?.nachname}, {user?.vorname}</span>
    }

    const statusTemplate = (rowData: Vorgang) => {
        const statusObj = ticket_status.find((t) => t.value === rowData.status);
        return <Tag label={statusObj?.label ?? ''} mode={statusObj?.severity} />;
    };

    // ACTIONS
    const selectTicket = (rowData: Vorgang) => {
        router.push(`/admin/vorgaenge/${rowData.id}`);
    };

    return (
        <>
            <Grid columns={3} gap={16}>
                <TextInputLabel label="Suche" onChange={setSearch} value={search} />
                <SelectLabel
                    label="Status"
                    onChange={setStatusFilter}
                    optionLabel="label"
                    optionValue="value"
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                />
            </Grid>
            <Row alignItems="center" justifyContent="space-between">
                <span className="text-meta">
                    {filteredTasks.length} von {tasks.length} Vorgängen
                </span>
                {filterAktiv && <Button label="Filter zurücksetzen" mode="tertiary" onClick={resetFilter} size="small" />}
            </Row>
            <DividerBlock height={1} />
            <DataTable
                emptyMessage={filterAktiv ? 'Keine Vorgänge gefunden. Passe die Filter an.' : 'Es wurden noch keine Aufgaben erstellt.'}
                onRowClick={(e) => selectTicket(e.data as Vorgang)}
                paginator
                rows={10}
                rowHover
                sortField="created_at"
                sortOrder={-1}
                stripedRows
                value={filteredTasks}
            >
                <Column field="titel" header="Name" sortable />
                <Column body={clientTemplate} header={header} style={{ width: "30%" }} />
                <Column body={(rowData: Vorgang) => formatDate(rowData.created_at)} field="created_at" header="Erstellt am" sortable style={{ width: 200 }} />
                <Column body={statusTemplate} field="status" header="Status" sortable style={{ width: 150 }} />
            </DataTable>
        </>

    )
}