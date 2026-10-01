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
import Link from 'next/link';
import { Dropdown } from 'primereact/dropdown';
import { UserAvatarOther } from '@/app/components/UserAvatar';
import { clientsLoadAgency, clientsLoadAll, clientUpdate } from '@/app/actions/clients';
import { Dialog } from 'primereact/dialog';
import { agencyLoadAll } from '@/app/actions/agency';
import { userUpdate } from '@/app/actions/users';

interface Props {
    clients: User[];
}
export function ClientTableSmall({clients}:Props) {
  const actionTemplate = (rowData: User) => {
    return (
      <Link href={`/admin/kunden/${rowData.id}`}>
        <Button className="button-square" icon="pi pi-search" text />
      </Link>
    );
  };

  const userTemplate = (rowData: User) => {
    return (
      <div className="row gap-s align-center">
        <UserAvatarOther fontSize={11} height={30} user={rowData} width={30} />
        <div className="column">
          <span style={{ fontSize: 14, fontWeight: 700 }}>
            {rowData.user_name_last}, {rowData.user_name_first}
          </span>
          <span style={{ fontSize: 12 }}>Angemeldet seit: {formatDate(rowData.created_at)}</span>
        </div>
      </div>
    );
  };

  return (
    <DataTable
      emptyMessage="Keine Kunden gefunden."
      value={clients
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)}
    >
      <Column body={userTemplate} header="Kunde" />
      <Column body={actionTemplate} header="Aktionen" />
    </DataTable>
  );
}