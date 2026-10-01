'use client';

import DividerBlock from '@/app/components/DividerBlock';
import LinkBlock from '@/app/components/cards/LinkBlock';
import { useAuth } from '@/app/context/AuthContext';
import Loader from '@/app/components/Loader';
import DocumentUploader from '../../documents/DocumentUploader';
import DocumentEditor from '../../documents/DocumentEditor';
import DocumentExplorer from '../../documents/DocumentExplorer';
import { useEffect, useState } from 'react';
import { Document, DocumentFolder } from '@/app/types/Database';
import { Dialog } from 'primereact/dialog';
import { documentDelete, documentsLoadUser } from '@/app/actions/documents';
import { foldersLoadUser } from '@/app/actions/folders';
import DocumentPreviewer from '../../documents/DocumentPreviewer';
import SkeletonGrid from '../../ui/loading/SkeletonGrid';

export default function Documents() {
  const { user, userProfile } = useAuth();

  // STATES
  const [inspecting, setInspecting] = useState(false);
  const [loading, setLoading] = useState(true);

  // DATA
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null);

  // INIT
  useEffect(() => {
    if (!userProfile) return;

    const fetchData = async () => {
      const [folderRes, docRes] = await Promise.all([
        foldersLoadUser(userProfile.id),
        documentsLoadUser(userProfile.id),
      ]);
      setFolders(folderRes);
      setDocuments(docRes);
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
    const res = await documentsLoadUser(userProfile?.id || '');
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
