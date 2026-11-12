'use client';

import { AgencyStats, User } from '@/app/types/Database';
import { agent_status } from '@/app/constants/Constants';
import { formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useRouter } from 'next/navigation';
import { UserAvatarOther } from '../../UserAvatar';
import { user_status } from '@/app/constants/status';
import Tag from '../../ui/Tag';

interface Props {
  users: User[];
}

export default function AgencyTable({ users }: Props) {
  const router = useRouter();

  const nameTemplate = (rowData: AgencyStats) => {
    const agent = users.find((u) => u.id === rowData.id);

    return (
      <div className="row gap-xs align-center">
        <span>
          {rowData.nachname}, {rowData.vorname}
        </span>
      </div>
    );
  };

  const statusTemplate = (rowData: User) => {
    const ref = rowData.user_id ? 'active' : 'inactive'
    const tag = user_status.find((u) => u.value == ref)
    if (!tag) return;
    return <Tag bgColor={tag.bg} color={tag.color} text={tag?.label} />
  }

  const selectAgent = (rowData: AgencyStats) => {
    router.push(`/admin/agenturen/${rowData.id}`);
  };

  return (
    <DataTable
      emptyMessage="Keine Agenturen gefunden."
      onRowClick={(e) => selectAgent(e.data as AgencyStats)}
      paginator
      rows={10}
      sortField="nachname"
      sortOrder={1}
      stripedRows
      value={users}
    >
      <Column body={nameTemplate} header="Name" />
      <Column body={statusTemplate} header="Status" />
      <Column field="firma" header="Firma" />
      <Column field="client_count" header="Kunden" />
      <Column body={(rowData) => formatDate(rowData.created_at)} header="Angemeldet seit" />
    </DataTable>
  );
}
