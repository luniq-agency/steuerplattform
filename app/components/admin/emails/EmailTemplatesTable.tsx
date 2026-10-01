'use client';

import { Client, EmailTemplate, User } from '@/app/types/Database';
import { client_status, job_categories } from '@/app/constants/Constants';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import Link from 'next/link';

interface Props {
  templates: EmailTemplate[];
}

export default function EmailTemplatesTable({ templates }: Props) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  //FILTER
  const [filters, setFilters] = useState<{
    global: { value: string | null; matchMode: FilterMatchMode };
    berufsstatus: { value: string | null; matchMode: FilterMatchMode };
    status: { value: string | null; matchMode: FilterMatchMode };
  }>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    berufsstatus: { value: null, matchMode: FilterMatchMode.EQUALS },
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

  const selectClient = (rowData: EmailTemplate) => {
    router.push(`/admin/einstellungen/emails/${rowData.id}`);
  };

  //TEMPLATES
  const actionTemplate = (rowData: EmailTemplate) => {
    return (
      <div className="row gap-s">
        <Link href={`/admin/einstellungen/emails/${rowData.id}`}>
          <Button className="button-square button-bordered" icon="pi pi-pencil" text />
        </Link>
        <Button className="button-square button-bordered" icon="pi pi-trash" text />
      </div>
    );
  };
  const categoryTemplates = (rowData: Client) => {
    const statusObj = job_categories.find((t) => t.value === rowData.berufsstatus);
    return <Tag style={{ backgroundColor: statusObj?.color }} value={statusObj?.label ?? ''} />;
  };

  const statusTemplate = (rowData: Client) => {
    const statusObj = client_status.find((t) => t.value === rowData.status);
    return <Tag severity={(statusObj?.severity as any) ?? 'info'} value={statusObj?.label ?? ''} />;
  };

  return (
    <>
      <Toast ref={toast} />
      <DataTable
        emptyMessage="Keine Vorlagen gefunden."
        paginator
        onRowClick={(e) => selectClient(e.data as EmailTemplate)}
        rows={10}
        stripedRows
        value={templates}
      >
        <Column field="title" header="Name" sortable />
        <Column body={actionTemplate} header="Aktionen" style={{ width: '3rem' }} />
      </DataTable>
    </>
  );
}
