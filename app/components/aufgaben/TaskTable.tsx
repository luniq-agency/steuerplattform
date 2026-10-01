'use client';

import { Client, Task, User } from '@/app/types/Database';
import { client_status, task_status } from '@/app/constants/Constants';
import { FilterMatchMode } from 'primereact/api';
import { formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { Dropdown } from 'primereact/dropdown';
import { UserAvatarOther } from '../UserAvatar';
import TaskBox from './TaskBox';
import EmptyListWidget from '../ui/EmptyListWidget';

interface Props {
  admins: User[];
  tasks: Task[];
}

export default function TaskTable({ admins, tasks }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  //FILTER
  const [filters, setFilters] = useState<{
    global: { value: string | null; matchMode: FilterMatchMode };
    status: { value: string | null; matchMode: FilterMatchMode };
  }>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, global: { ...prev.global, value } }));
    setGlobalFilterValue(value);
  };

  //SELECTION
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const selectTask = (rowData: Task) => {
    router.push(`/admin/aufgaben/${rowData.id}`);
  };

  const show = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Profil aktualisiert',
      detail: 'Das Profil des Kunden wurde aktualisiert.',
    });
  };

  //TEMPLATES
  const assigneeTemplate = (rowData: Task) => {
    const assignee = admins.find((t) => t.id === rowData.assignee);
    return (
      <div className="row align-center gap-s">
        <UserAvatarOther fontSize={11} height={24} user={assignee} width={24} />
        <span>
          {assignee?.user_name_last}, {assignee?.user_name_first}
        </span>
      </div>
    );
  };

  const dateTemplate = (rowData: Task) => {
    if (!rowData.due_date) return <span>–</span>;

    return <span>{formatDate(rowData.due_date)}</span>;
  };
  const statusTemplate = (rowData: Task) => {
    const statusObj = task_status.find((t) => t.value === rowData.status);
    return <Tag severity={(statusObj?.severity as any) ?? 'info'} value={statusObj?.label ?? ''} />;
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="mobile-hidden">
        <div className="container">
          <DataTable
            emptyMessage="Keine Aufgaben gefunden."
            filters={filters}
            globalFilterFields={['vorname', 'nachname']}
            onRowClick={(e) => selectTask(e.data as Task)}
            paginator
            rows={10}
            stripedRows
            value={tasks}
          >
            <Column field="title" header="Name" sortable />
            <Column body={assigneeTemplate} header="Bearbeiter" />
            <Column
              body={(rowData) => formatDate(rowData.created_at)}
              header="Erstellt"
              sortable
              style={{ width: '12%' }}
            />
            <Column body={dateTemplate} header="Fällig bis" sortable style={{ width: '12%' }} />
            <Column
              body={statusTemplate}
              filter
              filterElement={(options) => (
                <Dropdown
                  options={task_status}
                  optionLabel="label"
                  optionValue="value"
                  value={options.value}
                  onChange={(e) => options.filterCallback(e.value, options.index)}
                  placeholder="Status"
                  showClear
                />
              )}
              header="Status"
              sortable
              style={{ width: '18%' }}
            />
          </DataTable>
        </div>
      </div>
      <div className="mobile-visible">
        {tasks.map((t, i) => (
          <TaskBox key={i} task={t} users={admins} />
        ))}
      </div>
    </>
  );
}

export function TaskTableSmall({ admins, tasks }: Props) {
  const router = useRouter();

  const selectRow = (rowData: Task) => {
    router.push(`/admin/aufgaben/${rowData.id}`);
  };

  const hasTasks = tasks.length >= 1;

  const assigneeTemplate = (rowData: Task) => {
    const assignee = admins.find((t) => t.id === rowData.assignee);
    return (
      <div className="row align-center gap-s">
        <UserAvatarOther fontSize={11} height={24} user={assignee} width={24} />
        <span>{assignee?.user_name_first}</span>
      </div>
    );
  };

  const statusTemplate = (rowData: Task) => {
    const statusObj = task_status.find((t) => t.value === rowData.status);
    return <Tag severity={(statusObj?.severity as any) ?? 'info'} value={statusObj?.label ?? ''} />;
  };

  return (
    <>
      {hasTasks ? (
        <DataTable onRowClick={(e) => selectRow(e.data as Task)} rows={5} stripedRows value={tasks}>
          <Column field="title" header="Name" />
          <Column body={assigneeTemplate} header="Bearbeiter" />
          <Column body={statusTemplate} header="Status" style={{ width: '18%' }} />
        </DataTable>
      ) : (<EmptyListWidget text="Keine offenen Aufgaben gefunden" />
      )}
    </>
  );
}
