"use client"

import { usersLoadByRole } from '@/app/actions/users';
import Button from '@/app/components/buttons/Button';
import DividerBlock from '@/app/components/DividerBlock';
import SearchBox from '@/app/components/forms/SearchBox';
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
import { useEffect, useState } from 'react';


export default function Kunden() {
    const { userProfile } = useAuth();
    const router = useRouter();

    // DATA
    const [kunden, setKunden] = useState<User[]>([]);

    // INPUTS
    const [search, setSearch] = useState('');

    // INIT
    useEffect(() => {
        if (!userProfile) return;
        const fetchData = async () => {
            const res = await usersLoadByRole('client');
            setKunden(res)
        }
        fetchData()
    }, [userProfile])

    // ACTIONS
    const selectClient = (u: User) => {
        router.push(`/admin/kunden/${u.id}`);
    }

    // TEMPLATES
    const berufsstatus = (rowData: User) => {
        const status = job_categories.find((j) => j.value === rowData.berufsstatus);
        return <Tag bgColor={status?.bg || 'blue'} color={status?.color || 'white'} text={status?.label || ''} />
    }

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Kunden</h1>
                <SearchBox maxWidth={400} onChange={setSearch} value={search} />
                <Row alignItems="center" gap={8} width="fit-content">
                    <Link href="/admin/kunden/neu">
                        <Button icon={Plus} label="Neuer Kunde" mode="secondary" size="small" />
                    </Link>
                </Row>
            </Row>
            <DividerBlock height={2} />
            <DataTable onRowClick={(e) => selectClient(e.data as User)} paginator rows={12} sortField="nachname" sortOrder={1} stripedRows value={kunden}>
                <Column body={(rowData) => <span>{rowData.nachname}, {rowData.vorname}</span>} header="Name" />
                <Column body={berufsstatus} header="Berufsstatus" sortable sortField='berufsstatus' />
                <Column body={(rowData) => <span>{formatDate(rowData.created_at)}</span>} header="Registriert seit" sortable sortField='created_at' />
            </DataTable>
        </div>
    )
}