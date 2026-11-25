"use client"

import { usersLoadAll, usersLoadByRole, userUpdate } from '@/app/actions/users';
import Button from '@/app/components/buttons/Button';
import DividerBlock from '@/app/components/DividerBlock';
import SearchBox from '@/app/components/forms/SearchBox';
import { SelectLabel, UserSelectLabel } from '@/app/components/inputs/Select';
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

    // SELECTIONS
    const [auswahl, setAuswahl] = useState<User[]>([]);
    const [selectedAgent, setSelectedAgent] = useState<User | null>(null);

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
    const assignClient = async () => {
        auswahl.map(async (a) => await userUpdate({ bearbeiter: selectedAgent?.id }, a.id))
        await usersLoadAll();
    }

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
        <div className="page-content">
            <Row alignItems="center" justifyContent="space-between">
                <h1>Kunden</h1>
                <Link href="/admin/kunden/neu">
                    <Button icon={Plus} label="Neuer Kunde" mode="secondary" size="small" />
                </Link>
            </Row>
            <DividerBlock height={2} />
            {/* FILTER */}
            <Row alignItems="center" justifyContent='space-between'>
                <Row alignItems="center" gap={16}>
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
                <Row alignItems="center" gap={8} width="fit-content">
                    {auswahl.length > 0 && <UserSelectLabel maxWidth={300} onChange={setSelectedAgent} options={agenturisten} placeholder='Agenturist auswählen' value={selectedAgent} />}
                    {auswahl.length > 0 && <Button label="Kunden zuordnen" mode="primary" onClick={assignClient} size="small" />}
                </Row>
            </Row>
            <DividerBlock height={1} />
            <span className="text-meta">
                {gefiltert.length} von {kunden.length} Kunden
            </span>
            <DividerBlock height={1} />
            <DataTable
                emptyMessage={filterAktiv ? 'Keine Kunden gefunden. Passe Suche oder Filter an.' : 'Noch keine Kunden vorhanden.'}
                onRowClick={(e) => selectClient(e.data as User)}
                onSelectionChange={(e) => setAuswahl(e.value as User[])}
                paginator
                rowHover
                rows={12}
                selection={auswahl}
                selectionMode="checkbox"
                sortField="nachname"
                sortOrder={1}
                stripedRows
                value={gefiltert}
            >
                <Column headerStyle={{ width: 48 }} selectionMode="multiple" />
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