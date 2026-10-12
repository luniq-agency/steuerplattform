'use client';

import { User } from '@/app/types/Database';
import { client_status, job_categories } from '@/app/constants/Constants';
import { FilterMatchMode } from 'primereact/api';
import { formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { UserAvatarOther } from '@/app/components/UserAvatar';
import { clientUpdate } from '@/app/actions/clients';
import { Dialog } from 'primereact/dialog';
import { userUpdate } from '@/app/actions/users';
import { useAuth } from '@/app/context/AuthContext';

interface Props {
  bearbeiter?: User;
  clients?: User[];
  search?: string;
}

export default function ClientTable({ bearbeiter, clients, search }: Props) {
  const router = useRouter();
  const toast = useRef<Toast | null>(null);
  const { userProfile } = useAuth();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1025);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (search !== undefined) {
      setFilters((prev) => ({ ...prev, global: { ...prev.global, value: search } }));
      setGlobalFilterValue(search);
    }
  }, [search]);

  //
  const [agents, setAgents] = useState<User[]>([]);
  const [transferring, setTransferring] = useState(false);
  const [transferTarget, setTransferTarget] = useState<User | null>(null);

  //DATA
  const [selectedClients, setSelectedClients] = useState<User[]>([]);
  const [rowClick, setRowClick] = useState(true);

  //FILTER
  const [filters, setFilters] = useState<{
    global: { value: string | null; matchMode: FilterMatchMode };
    job_status: { value: string | null; matchMode: FilterMatchMode };
    status: { value: string | null; matchMode: FilterMatchMode };
  }>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    job_status: { value: null, matchMode: FilterMatchMode.EQUALS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const isAdmin = userProfile?.rolle === 'admin';

  //SELECTION
  const selectClient = (rowData: User) => {
    router.push(`/admin/kunden/${rowData.id}`);
  };

  const show = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Profil aktualisiert',
      detail: 'Das Profil des Kunden wurde aktualisiert.',
    });
  };

  //TEMPLATES
  const actionTemplate = (rowData: User) => {
    return (
      <div className="row gap-xs">
        <Button
          className="button-square"
          icon="pi pi-pencil"
          onClick={(e) => selectClient(rowData as User)}
        />
      </div>
    );
  };

  const categoryTemplates = (rowData: User) => {
    const statusObj = job_categories.find((t) => t.value === rowData.job_status);
    return (
      <Tag
        style={{ backgroundColor: statusObj?.bg, color: statusObj?.color }}
        value={statusObj?.label ?? ''}
      />
    );
  };

  const certificateTemplate = (rowData: User) => {
    return <span>{rowData.certificate ? '✅' : '❌'}</span>;
  };

  const nameTemplate = (rowData: User) => {
    const job = job_categories.find((t) => t.value === rowData.job_status);

    return (
      <div className="row gap-s align-center">
        <UserAvatarOther
          backgroundColor={job?.bg}
          color={job?.color}
          fontSize={11}
          height={30}
          user={rowData}
          width={30}
        />
        <span>
          {rowData.nachname}, {rowData.vorname}
        </span>
      </div>
    );
  };

  const statusTemplate = (rowData: User) => {
    if (!rowData.status) return;

    const statusObj = client_status.find((t) => t.value === rowData.status);
    return (
      <Tag
        style={{
          backgroundColor: statusObj?.bg,
          color: statusObj?.color,
        }}
        value={statusObj?.label ?? ''}
      />
    );
  };

  const transferClients = async () => {
    if (!transferTarget) return;

    try {
      await Promise.all(
        selectedClients.map((client) => {
          clientUpdate({ bearbeiter: transferTarget.id }, client.client_profile);
          userUpdate({ bearbeiter: transferTarget.id }, client.id);
        })
      );
      setTransferring(false);
      setSelectedClients([]);
      setTransferTarget(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setTransferring(false);
      setTransferTarget(null);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Kunden zuweisen"
        onHide={() => setTransferring(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={transferring}
      >
        <div className="column gap-m">
          <div className="column gap-xs">
            <label>Bearbeiter</label>
            <Dropdown
              filter
              filterPlaceholder="Suchen"
              onChange={(e) => setTransferTarget(e.value)}
              optionLabel="fullName"
              options={agents.map((a) => ({
                ...a,
                fullName: `${a.nachname}, ${a.vorname}`,
              }))}
              value={transferTarget}
            />
          </div>
          <Button
            disabled={!transferTarget || selectedClients.length === 0}
            label="Kunden zuweisen"
            onClick={transferClients}
          />
        </div>
      </Dialog>
      <div>
        {selectedClients.length >= 1 && bearbeiter && (
          <Button label="Kunden zuweisen" onClick={() => setTransferring(true)} />
        )}
        <DataTable
          currentPageReportTemplate="{first} bis {last} von {totalRecords} Kunden"
          emptyMessage="Keine Kunden gefunden."
          filterDisplay="menu"
          filters={filters}
          globalFilterFields={['vorname', 'nachname']}
          paginator
          onSelectionChange={(e: any) => setSelectedClients(e.value)}
          paginatorTemplate="FirstPageLink PrevPageLink NextPageLink LastPageLink CurrentPageReport"
          rows={10}
          selection={selectedClients}
          selectionMode={rowClick ? null : 'checkbox'}
          sortField="nachname"
          sortOrder={1}
          stripedRows
          value={clients}
        >
          <Column body={nameTemplate} field="nachname" header="Name" sortable />
          <Column
            body={categoryTemplates}
            field="job_status"
            filter
            filterElement={(options) => (
              <Dropdown
                options={job_categories}
                optionLabel="label"
                optionValue="value"
                value={options.value}
                onChange={(e) => options.filterCallback(e.value, options.index)}
                placeholder="Status"
                showClear
              />
            )}
            header="Berufsstatus"
            hidden={isMobile}
          />
          <Column body={certificateTemplate} header="Zertifikatsdatei" hidden={isMobile} />
          <Column
            body={(rowData) => formatDate(rowData.created_at)}
            field="created_at"
            header="Angemeldet seit"
            hidden={isMobile}
            sortable
            style={{ width: '15%' }}
          />
          <Column
            body={statusTemplate}
            field="status"
            filter
            filterMatchMode="equals"
            filterElement={(options) => (
              <Dropdown
                options={client_status}
                optionLabel="label"
                optionValue="value"
                value={options.value}
                onChange={(e) => options.filterCallback(e.value)}
                placeholder="Status"
                showClear
              />
            )}
            header="Status"
            hidden={isMobile || !isAdmin}
            sortable
          />
          <Column body={actionTemplate} header="Aktionen" hidden={isMobile} />
        </DataTable>
      </div>
    </>
  );
}
