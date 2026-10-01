'use client';

import { Document, User } from '@/app/types/Database';
import { FilterMatchMode } from 'primereact/api';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Tag } from 'primereact/tag';
import { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { useRouter } from 'next/navigation';
import { UserAvatarOther } from '@/app/components/UserAvatar';
import { documentsLoadAll } from '@/app/actions/documents';
import { usersLoadAll } from '@/app/actions/users';
import { Sidebar } from 'primereact/sidebar';
import DocumentEditor from './DocumentEditor';
import { Dialog } from 'primereact/dialog';
import { document_options } from '@/app/constants/Constants';
import { formatDate } from '@/app/utils/formats';

export default function DocumentList() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  const [mounted, setMounted] = useState(false);

  //DATA
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (mounted) return;
    const fetchData = async () => {
      try {
        const docuRes = await documentsLoadAll();
        const userRes = await usersLoadAll();
        setDocuments(docuRes);
        setUsers(userRes);
        setMounted(true);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [mounted]);

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

  //ACTIONS
  const refreshList = async () => {
    try {
      const docuRes = await documentsLoadAll();
      setDocuments(docuRes);
    } catch (err) {
      console.error(err);
    }
  };

  //TEMPLATES
  const dateTemplate = (rowData: Document) => {
    return <span>{formatDate(rowData.created_at)}</span>
  }

  const fileTypeTemplate = (rowData: Document) => {
    const type = document_options.find((t) => t.value === rowData.file_type);

    if (!rowData.file_type) return <Tag style={{ backgroundColor: 'grey' }} value="Ohne" />;

    return <Tag style={{ backgroundColor: type?.bg }} value={type?.label} />;
  };

  const nameTemplate = (rowData: Document) => {
    if (!users || !rowData.user) return;
    const profile = users.find((t) => t.id === rowData.user);

    return (
      <div className="row gap-s align-center">
        <UserAvatarOther fontSize={12} height={32} user={profile} width={32} />
        <span>
          {profile?.user_name_last || ''}, {profile?.user_name_first || ''}
        </span>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        draggable={false}
        header="Dokument bearbeiten"
        onHide={() => setVisible(false)}
        style={{ height: '80vh', maxWidth: '70vw', width: '100%' }}
        visible={visible}
      >
        {selectedDocument && (
          <DocumentEditor document={selectedDocument} onSave={refreshList} users={users} />
        )}
      </Dialog>
      <DataTable
        emptyMessage="Keine Dokumente gefunden."
        filterDisplay="menu"
        filters={filters}
        globalFilterFields={['vorname', 'nachname']}
        paginator
        onRowClick={(e) => {
          setVisible(true);
          setSelectedDocument(e.data as Document);
        }}
        rows={10}
        sortField="document_name"
        sortOrder={1}
        stripedRows
        value={documents}
      >
        <Column field="document_name" header="Name" sortable />
        <Column body={fileTypeTemplate} header="Dateityp" sortable />
        <Column body={dateTemplate} header="Datum (upload)" sortable />
        <Column body={nameTemplate} header="Kunde" />
      </DataTable>
    </>
  );
}
