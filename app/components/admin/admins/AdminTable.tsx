'use client';

import { Agent, User } from '@/app/types/Database';
import { client_status } from '@/app/constants/Constants';
import { formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import LayoutColumn from '@/app/components/layout/Column';
import Tag from '../../ui/Tag';
import Row from '../../layout/Row';
import { ContextButton, PrimaryButton } from '../../buttons/Buttons';
import { EllipsisVertical, Mail, Pencil } from 'lucide-react';
import { useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { TextInputLabel } from '../../forms/FormElements';
import { OverlayPanel } from 'primereact/overlaypanel';
import { sendAdminInviteEmail } from '@/app/actions/email';

interface Props {
  admins: User[];
}

export default function AdminsTable({ admins }: Props) {
  const op = useRef<OverlayPanel | null>(null);

  // STATES
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [visible, setVisible] = useState(false);

  // ACTIONS
  const selectUser = (u: User) => {
    setSelectedUser(u);
    setVisible(true);
  };

  const sendInvite = async (u: User) => {
    op.current?.hide();
    const name = u.user_name_first;
    console.log(name, u.email, u.id);
    await sendAdminInviteEmail(name, u.email, u.id);
  };

  const nameTemplate = (rowData: User) => {
    return (
      <span>
        {rowData.user_name_last}, {rowData.user_name_first}
      </span>
    );
  };

  const actionTemplate = (rowData: User) => {
    return (
      <>
        <OverlayPanel ref={op}>
          <ContextButton
            icon={Mail}
            label="Einladung erneut versenden"
            onClick={() => sendInvite(rowData)}
          />
        </OverlayPanel>
        <Row gap={0}>
          <ContextButton icon={Pencil} onClick={() => selectUser(rowData)} />
          <ContextButton
            icon={EllipsisVertical}
            onClick={(e) => {
              op.current?.toggle(e);
            }}
          />
        </Row>
      </>
    );
  };

  const statusTemplate = (rowData: User) => {
    const status = client_status.find((t) => t.value === rowData.status);
    if (!status) return <span>–</span>;
    return <Tag bgColor={status.bg} color={status.color} text={status.label}></Tag>;
  };

  return (
    <>
      <Dialog
        header="Profil ansehen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 480 }}
        visible={visible}
      >
        <LayoutColumn>
          <TextInputLabel label="Vorname" readonly value={selectedUser?.user_name_first} />
          <TextInputLabel label="Nachname" readonly value={selectedUser?.user_name_last} />
          <TextInputLabel label="E-Mail" readonly value={selectedUser?.email} />
          <PrimaryButton
            label="Einladung erneut versenden"
            onClick={() => sendInvite(selectedUser!)}
            size="medium"
          />
        </LayoutColumn>
      </Dialog>
      <DataTable
        emptyMessage="Keine Agenturen gefunden."
        paginator
        rows={10}
        sortField="user_name_last"
        sortOrder={1}
        stripedRows
        value={admins}
      >
        <Column body={nameTemplate} header="Name" />
        <Column body={(rowData) => formatDate(rowData.created_at)} header="Angemeldet seit" />
        <Column body={statusTemplate} header="Status" />
        <Column body={actionTemplate} />
      </DataTable>
    </>
  );
}
