"use client"

import { usersLoadAll, usersLoadByRole } from '@/app/actions/users';
import Button from '@/app/components/buttons/Button';
import DividerBlock from '@/app/components/DividerBlock';
import SearchBox from '@/app/components/forms/SearchBox';
import { SelectLabel } from '@/app/components/inputs/Select';
import Row from '@/app/components/layout/Row';
import Tag from '@/app/components/ui/Tag';
import { job_categories } from '@/app/constants/Constants';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import { formatDate } from '@/app/utils/formats';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONEN = [{ label: 'Alle Berufsstatus', value: '' }, ...job_categories];

// Kleinschreibung und Umlaute vereinheitlichen, damit "muller" auch "Müller" findet
const normalisieren = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');

export default function Kunden() {
    const { userProfile } = useAuth();
    const router = useRouter();

    // DATA
    const [agenturisten, setAgenturisten] = useState<User[]>([]);
    const [kunden, setKunden] = useState<User[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // FILTER
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // INIT
    useEffect(() => {
        if (!userProfile) return;
        const fetchData = async () => {
            const res = await usersLoadAll();
            setUsers(res);
            setAgenturisten(res.filter((k) => k.rolle == 'agency'));
            setKunden(res.filter((k) => k.rolle == 'client'));
        }
        fetchData();
    }, [userProfile?.id]);

    // Gefilterte Liste für die Tabelle
    const gefiltert = useMemo(() => {
        const begriff = normalisieren(search.trim());

        return kunden.filter((k) => {
            if (statusFilter && k.berufsstatus !== statusFilter) return false;
            if (!begriff) return true;

            const text = normalisieren(
                [k.vorname, k.nachname, `${k.nachname} ${k.vorname}`, k.email, k.telefon, k.ort, k.beruf]
                    .filter(Boolean)
                    .join(' ')
            );
            return text.includes(begriff);
        });
    }, [kunden, search, statusFilter]);

    const filterAktiv = !!search || !!statusFilter;

    // ACTIONS
    const selectClient = (u: User) => router.push(`/admin/kunden/${u.id}`);

    const resetFilter = () => {
        setSearch('');
        setStatusFilter('');
    };

    // TEMPLATES
    const bearbeiter = (rowData: User) => {
        const agenturist = agenturisten.find((a) => a.id == rowData.bearbeiter);
        if (!agenturist) return;
        return <span>{agenturist.nachname}, {agenturist.vorname}</span>
    };

    const berufsstatus = (rowData: User) => {
        const status = job_categories.find((j) => j.value === rowData.berufsstatus);
        if (!status) return <span>–</span>;
        return <Tag bgColor={status.bg || 'blue'} color={status.color || 'white'} text={status.label} />;
    };

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Kunden</h1>
                <Link href="/admin/kunden/neu">
                    <Button icon={Plus} label="Neuer Kunde" mode="secondary" size="small" />
                </Link>
            </Row>
            <DividerBlock height={2} />

            {/* FILTER */}
            <Row alignItems="end" gap={16}>
                <div style={{ flex: 1, maxWidth: 400 }}>
                    <SearchBox maxWidth={400} onChange={setSearch} value={search} />
                </div>
                <div style={{ width: 240 }}>
                    <SelectLabel
                        onChange={setStatusFilter}
                        optionLabel="label"
                        optionValue="value"
                        options={STATUS_OPTIONEN}
                        value={statusFilter}
                    />
                </div>
                {filterAktiv && <Button label="Filter zurücksetzen" mode="tertiary" onClick={resetFilter} size="small" />}
            </Row>
            <DividerBlock height={1} />
            <span className="text-meta">
                {gefiltert.length} von {kunden.length} Kunden
            </span>
            <DividerBlock height={1} />

            <DataTable
                emptyMessage={filterAktiv ? 'Keine Kunden gefunden. Passe Suche oder Filter an.' : 'Noch keine Kunden vorhanden.'}
                onRowClick={(e) => selectClient(e.data as User)}
                paginator
                rowHover
                rows={12}
                sortField="nachname"
                sortOrder={1}
                stripedRows
                value={gefiltert}
            >
                <Column
                    body={(rowData: User) => <span>{rowData.nachname}, {rowData.vorname}</span>}
                    field="nachname"
                    header="Name"
                    sortable
                    style={{ width: "30%" }}
                />
                <Column body={berufsstatus} field="berufsstatus" header="Berufsstatus" sortable style={{ width: 250 }} />
                <Column body={bearbeiter} header="Bearbeiter" sortable style={{ width: "30%" }} />
                <Column
                    body={(rowData: User) => <span>{formatDate(rowData.created_at)}</span>}
                    field="created_at"
                    header="Registriert seit"
                    sortable
                />
            </DataTable>
        </div>
    );
}