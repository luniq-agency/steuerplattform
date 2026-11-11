'use client';

import DividerBlock from '@/app/components/DividerBlock';
import { useAuth } from '@/app/context/AuthContext';
import DocumentUploader from '../../components/documents/DocumentUploader';
import DocumentExplorer from '../../components/documents/DocumentExplorer';
import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { documentDelete, documentsLoadUser, fetchDocsByTeam } from '@/app/actions/documents';
import { foldersLoadUser } from '@/app/actions/folders';
import DocumentPreviewer from '../../components/documents/DocumentPreviewer';
import SkeletonGrid from '../../components/ui/loading/SkeletonGrid';
import { Dokument, DokumentOrdner } from '@/app/types/docs';
import { fetchDokumenteAgency } from '@/app/actions/agency/agencyDokumente';
import { User } from '@/app/types/Database';
import Row from '@/app/components/layout/Row';

export default function Dokumente() {
  const { userProfile } = useAuth();

  // STATES
  const [inspecting, setInspecting] = useState(false);
  const [loading, setLoading] = useState(true);

  // DATA
  const [documents, setDocuments] = useState<Dokument[]>([]);
  const [folders, setFolders] = useState<DokumentOrdner[]>([]);
  const [mandanten, setMandanten] = useState<User[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Dokument | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DokumentOrdner | null>(null);


  // INIT
  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      const res = await fetchDokumenteAgency(userProfile.id);
      setDocuments(res.dokumente);
      setFolders(res.ordner);
      setMandanten(res.mandanten);
      console.log('Mandanten:', res.mandanten);
      console.log('Dokumente:', res.dokumente);
    };
    fetchData();
    setLoading(false);
  }, [userProfile]);

  // ACTIONS
  const docDelete = async () => {
    if (!selectedDoc) return;
    try {
      await documentDelete(selectedDoc.id);
    } catch (err) {
      console.error(err);
    }
    setInspecting(false);
  };

  const updateDocuments = async () => {
    if (!userProfile) return;
    const res = await fetchDokumenteAgency(userProfile.id);
    setDocuments(res.dokumente);
    setFolders(res.ordner);
    setMandanten(res.mandanten);
  };

  if (loading || !userProfile) return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <div className="row space-between">
        <h1>Dokumente</h1>
      </div>
      <DividerBlock height={2} />
      <SkeletonGrid columns="1fr 1fr 1fr 1fr" count={8} gap={16} height="140px" width="100%" />
    </div>
  );

  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Dialog
        onHide={() => setInspecting(false)}
        style={{ height: '90vh', maxWidth: '90vw', width: '100%' }}
        visible={inspecting}
      >
        {selectedDoc && <DocumentPreviewer doc={selectedDoc} />}
      </Dialog>
      <Row alignItems='center' justifyContent='space-between'>
        <h1>Dokumente</h1>
        <DocumentUploader
          folder={selectedFolder?.id || null}
          onBehalf
          onUpload={updateDocuments}
          owner={userProfile.id}
          users={mandanten}
        />
      </Row>
      <DividerBlock height={2} />
      <DocumentExplorer
        documents={documents}
        folders={folders}
        loading={loading}
        onCreate={updateDocuments}
        onDelete={updateDocuments}
        onSelectDoc={(doc) => {
          setSelectedDoc(doc);
          setInspecting(true);
        }}
        onSelectFolder={(folder) => setSelectedFolder(folder)}
        owner={userProfile.id}
        showOwner
        users={mandanten}
      />
    </div>
  );
}
