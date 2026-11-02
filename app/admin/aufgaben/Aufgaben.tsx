'use client';

import { adminsLoadAll } from '@/app/actions/admin';
import { usersLoadAll } from '@/app/actions/users';
import { fetchVorgaengeAll } from '@/app/actions/vorgang/vorgang';
import Button from '@/app/components/buttons/Button';
import DividerBlock from '@/app/components/DividerBlock';
import { TextInputLabel } from '@/app/components/forms/FormElements';
import { SelectLabel } from '@/app/components/inputs/Select';
import Grid from '@/app/components/layout/Grid';
import Row from '@/app/components/layout/Row';
import { ticket_status } from '@/app/constants/Constants';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import { Vorgang } from '@/app/types/vorgang';
import { formatDate } from '@/app/utils/formats';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = [{ label: 'Alle', value: '' }, ...ticket_status];

export default function Aufgaben() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // DATA
  const [admins, setAdmins] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Vorgang[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // FILTER
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // STATES
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      const [adminRes, taskRes, userRes] = await Promise.all([
        adminsLoadAll(),
        fetchVorgaengeAll(),
        usersLoadAll(),
      ]);
      setAdmins(adminRes);
      setTasks(taskRes);
      setUsers(userRes);
      setLoading(false);
    };
    fetchData();
  }, [userProfile]);

  const refresh = async () => {
    if (!userProfile) return;
    setTasks(await fetchVorgaengeAll());
  };

  // HELPERS
  const userName = (id: Vorgang['created_by']) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.vorname ?? ''} ${u.nachname ?? ''}`.trim() : '';
  };

  // Aufgaben nach Status und Suchbegriff filtern
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

  const filterAktiv = !!search || !!statusFilter;

  const resetFilter = () => {
    setSearch('');
    setStatusFilter('');
  };

  // ACTIONS
  const selectTicket = (rowData: Vorgang) => {
    router.push(`/admin/aufgaben/${rowData.id}`);
  };

  // TEMPLATES
  const statusTemplate = (rowData: Vorgang) => {
    const statusObj = ticket_status.find((t) => t.value === rowData.status);
    return <Tag severity={(statusObj?.severity as any) ?? 'info'} value={statusObj?.label ?? ''} />;
  };

  return (
    <div className="page-content">
      <Row justifyContent="space-between">
        <h1>Aufgaben</h1>
        <Button icon={Plus} label="Aufgabe erstellen" mode="secondary" onClick={() => setCreating(true)} size="small" />
      </Row>
      <DividerBlock height={2} />

      {/* FILTER */}
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
      <DividerBlock height={1} />
      <Row alignItems="center" justifyContent="space-between">
        <span className="text-meta">
          {filteredTasks.length} von {tasks.length} Aufgaben
        </span>
        {filterAktiv && <Button label="Filter zurücksetzen" mode="tertiary" onClick={resetFilter} size="small" />}
      </Row>
      <DividerBlock height={1} />

      {!loading && (
        <DataTable
          emptyMessage={filterAktiv ? 'Keine Aufgaben gefunden. Passe die Filter an.' : 'Es wurden noch keine Aufgaben erstellt.'}
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
          <Column body={(rowData: Vorgang) => userName(rowData.created_by) || '–'} header="Mandant" />
          <Column body={(rowData: Vorgang) => formatDate(rowData.created_at)} field="created_at" header="Erstellt am" sortable />
          <Column body={statusTemplate} field="status" header="Status" sortable />
        </DataTable>
      )}
    </div>
  );
}