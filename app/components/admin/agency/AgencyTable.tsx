'use client';

import { AgencyStats, User } from '@/app/types/Database';
import { agent_status } from '@/app/constants/Constants';
import { formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { useRouter } from 'next/navigation';
import { UserAvatarOther } from '../../UserAvatar';

interface Props {
  agents: AgencyStats[];
  users: User[];
}

export default function AgencyTable({ agents, users }: Props) {
  const router = useRouter();

  const nameTemplate = (rowData: AgencyStats) => {
    const agent = users.find((u) => u.id === rowData.id);

    return (
      <div className="row gap-xs align-center">
        <UserAvatarOther
          backgroundColor="var(--primary)"
          color="white"
          fontSize={12}
          height={32}
          user={agent}
          width={32}
        />
        <span>
          {rowData.user_name_last}, {rowData.user_name_first}
        </span>
      </div>
    );
  };

  const selectAgent = (rowData: AgencyStats) => {
    router.push(`/admin/agenturen/${rowData.id}`);
  };

  return (
    <DataTable
      emptyMessage="Keine Agenturen gefunden."
      onRowClick={(e) => selectAgent(e.data as AgencyStats)}
      paginator
      rows={10}
      sortField="user_name_last"
      sortOrder={1}
      stripedRows
      value={agents}
    >
      <Column body={nameTemplate} header="Name" />
      <Column field="firma" header="Firma" />
      <Column field="client_count" header="Kunden" />
      <Column body={(rowData) => formatDate(rowData.created_at)} header="Angemeldet seit" />
    </DataTable>
  );
}
