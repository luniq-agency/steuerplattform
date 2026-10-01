import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Certificate, Client, User } from '../types/Database';
import { useEffect, useState } from 'react';
import { certificatesLoadUser } from '../actions/certificates';
import DividerBlock from './DividerBlock';
import { Button } from 'primereact/button';

interface Props {
  user: User;
}

export default function CertificateTable({ user }: Props) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await certificatesLoadUser(user.id);
        setCertificates(res);
      } catch {}
    };
    fetchData();
  }, [user]);

  const actionTemplate = (rowData: Certificate) => {
    return (
      <div className="row gap-s align-center">
        <Button
          className="button-square"
          icon="pi pi-download"
          onClick={() => docDownload(rowData)}
          text
        />
      </div>
    );
  };

  const docDownload = (rowData: Certificate) => {
    const link = document.createElement('a');
    link.href = rowData.file;
    link.download = rowData.file;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className="column">
      <div className="row space-between">
        <h3>Zertifikate</h3>
        <Button className="button-secondary" icon="pi pi-upload" label="Zertifikat hochladen" />
      </div>
      <DividerBlock height={2} />
      <DataTable emptyMessage="Keine Zertifikate gefunden." value={certificates}>
        <Column field="year" header="Jahr" />
        <Column body={actionTemplate} header="Aktionen" />
      </DataTable>
    </div>
  );
}
