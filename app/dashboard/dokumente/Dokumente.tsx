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

export default function Dokumente() {
  const { team, user, userProfile } = useAuth();

  // STATES
  const [inspecting, setInspecting] = useState(false);
  const [loading, setLoading] = useState(true);

  // DATA
  const [documents, setDocuments] = useState<Dokument[]>([]);
  const [folders, setFolders] = useState<DokumentOrdner[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Dokument | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DokumentOrdner | null>(null);

  // INIT
  useEffect(() => {
    if (!userProfile || !team) return;
    const fetchData = async () => {
      const [folderRes, docRes] = await Promise.all([
        foldersLoadUser(userProfile.id),
        fetchDocsByTeam(team.id),
      ]);
      setFolders(folderRes);
      setDocuments(docRes);
      console.log('Dokumente:', docRes)
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
    const res = await documentsLoadUser(userProfile?.id);
    setDocuments(res);
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
      <div className="row space-between">
        <h1>Dokumente</h1>
        <DocumentUploader
          folder={selectedFolder?.id || null}
          onUpload={updateDocuments}
          owner={userProfile.id}
        />
      </div>
      <DividerBlock height={2} />
      <DocumentExplorer
        documents={documents}
        folders={folders}
        loading={loading}
        onDelete={updateDocuments}
        onSelectDoc={(doc) => {
          setSelectedDoc(doc);
          setInspecting(true);
        }}
        onSelectFolder={(folder) => setSelectedFolder(folder)}
        owner={userProfile.id}
      />
    </div>
  );
}
