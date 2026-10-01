'use client';

import { Client, Document, DocumentFolder, User } from '@/app/types/Database';
import DocumentFile, { DocumentListItem } from './DocumentFile';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import DocumentFolderBox, { FolderListItem } from './DocumentFolder';
import { useEffect, useRef, useState } from 'react';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import {
  documentDelete,
  documentsLoadUser,
  documentUpdate,
  documentUpload,
} from '@/app/actions/documents';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import DividerBlock from '@/app/components/DividerBlock';
import { useAuth } from '@/app/context/AuthContext';
import { ContextMenu } from 'primereact/contextmenu';
import { folderCreate, foldersLoadUser } from '@/app/actions/folders';
import Image from 'next/image';
import styles from './Documents.module.css';
import DocumentEditor from './DocumentEditor';
import { Toast } from 'primereact/toast';
import { DataScroller } from 'primereact/datascroller';
import DocumentUploader from './DocumentUploader';

interface Props {
  backgroundColor?: string;
  client?: Client;
  header?: boolean;
  hl?: boolean;
  user?: User;
}

export default function DocumentViewer({ backgroundColor, header, client, hl, user }: Props) {
  const { userProfile } = useAuth();
  const owner = user?.id || userProfile?.id;

  const folderMenu = useRef<ContextMenu | null>(null);
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  // STATES
  const [draggingDocument, setDraggingDocument] = useState<Document | null>(null);
  const [editing, setEditing] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // FOLDERS
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [pendingFolder, setPendingFolder] = useState<{ id: string; name: string } | null>(null);
  const pendingInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // DOCUMENTS
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentFile, setDocumentFile] = useState<{ file: File } | null>(null);
  const [documentName, setDocumentName] = useState('');

  // CONTEXT MENU FOLDERS
  const items = [
    {
      label: 'Neuen Ordner anlegen',
      command: () => createFolder(),
    },
  ];

  //INIT
  const fetchAll = async () => {
    if (!owner) return;
    try {
      const [docs, folderRes] = await Promise.all([
        documentsLoadUser(owner),
        foldersLoadUser(owner),
      ]);
      setDocuments(docs);
      setFolders(folderRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!owner) return;
    fetchAll();
  }, [owner]);

  const visibleFolders = folders.filter((f) => f.parent === selectedFolder);
  const visibleDocuments = documents.filter((d) => (d as any).folder === selectedFolder);

  const docDelete = async () => {
    if (!selectedDocument) return;

    try {
      await documentDelete(selectedDocument.id);
    } catch (err) {
      console.error(err);
    }
    setInspecting(false);
    updateDocuments();
  };

  const docDownload = () => {
    if (!selectedDocument) return;

    const link = document.createElement('a');
    link.href = selectedDocument.document_file;
    link.download = selectedDocument.document_name;
    link.target = '_blank';
    link.click();
  };

  const handleUpload = (e: FileUploadHandlerEvent) => {
    const file = e.files[0];
    setDocumentFile({ file });
  };

  const confirmFolder = async () => {
    if (!owner || !pendingFolder) return;

    console.log('Selected Folder:', selectedFolder);
    const name = pendingFolder.name.trim() || 'Neuer Ordner';

    const payload = {
      name,
      parent: selectedFolder,
      user: owner,
    };

    console.log('Folder Payload:', payload);

    try {
      await folderCreate(payload);
      await fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setPendingFolder(null);
    }
  };

  const deleteFolder = async () => {
    setSelectedFolder(null);
    await fetchAll();
  };

  const createFolder = async () => {
    if (!owner) return;

    // Temporär anzeigen
    const tempId = 'pending-' + Date.now();
    setPendingFolder({ id: tempId, name: '' });

    // Input focussieren nach Render
    setTimeout(() => pendingInputRef.current?.focus(), 50);
  };

  const dropOnFolder = async (folderId: string) => {
    if (!draggingDocument) return;

    try {
      await documentUpdate({ folder: folderId }, draggingDocument.id);
      await fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setDraggingDocument(null);
    }
  };

  const inspectorHeader = () => {
    return (
      <div className="row space-between" style={{ paddingRight: 16 }}>
        <h3>{selectedDocument?.document_name}</h3>
        <div className="row gap-xs">
          <Button
            className="button-square"
            icon="pi pi-pencil"
            onClick={() => setEditing(true)}
            text
          />
          <Button className="button-square" icon="pi pi-download" onClick={docDownload} text />
          <Button
            className="button-square"
            icon="pi pi-trash"
            onClick={docDelete}
            style={{ color: 'red' }}
            text
          />
        </div>
      </div>
    );
  };

  const selectDocument = (e: Document) => {
    setSelectedDocument(e);
    setInspecting(true);
  };

  const updateDocument = async () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Dokument aktualisiert',
      detail: 'Das Dokument wurde aktualisiert.',
    });
    setEditing(false);
    updateDocuments();
    setInspecting(false);
  };

  const updateDocuments = async () => {
    const res = await documentsLoadUser(owner || '');
    setDocuments(res);
  };

  const uploadDocument = async () => {
    setSubmitting(true);
    if (!documentFile || !owner) return;

    try {
      await documentUpload(
        documentFile.file,
        'docx',
        documentName,
        documentName,
        owner,
        selectedFolder
      );
      setDocumentFile(null);
      setDocumentName('');
      const [docs, folderRes] = await Promise.all([
        documentsLoadUser(owner),
        foldersLoadUser(owner),
      ]);
      setFolders(folderRes);
      const visibleDocuments = docs.filter((d) => (d as any).folder === selectedFolder);
    } catch (err) {
      console.error('Upload Fehler:', err);
    } finally {
      setSubmitting(false);
      setVisible(false);
      updateDocuments();
    }
  };

  if (!owner) return;

  return (
    <div className="column height-100">
      <Toast ref={toast} />
      <Dialog
        draggable={false}
        header={inspectorHeader}
        onHide={() => setInspecting(false)}
        style={{ height: '90vh', maxWidth: '80vw', width: '100%' }}
        visible={inspecting}
      >
        <div className="row height-100 width-100 gap-l">
          {editing && selectedDocument && (
            <div className="width-100">
              <DocumentEditor document={selectedDocument} onSave={updateDocument} />
            </div>
          )}
          {!editing && selectedDocument?.file_type === 'pdf' ? (
            <iframe
              src={
                selectedDocument?.document_file.endsWith('.pdf')
                  ? selectedDocument?.document_file
                  : `https://docs.google.com/viewer?url=${encodeURIComponent(selectedDocument.document_file)}&embedded=true`
              }
              style={{ border: 'none', height: '70vh', width: '100%' }}
            />
          ) : !editing && selectedDocument?.file_type === 'image' ? (
            <div
              style={{ height: '100%', objectFit: 'cover', position: 'relative', width: '100%' }}
            >
              <Image
                alt=""
                fill={true}
                src={selectedDocument?.document_file || ''}
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : null}
        </div>
      </Dialog>
      <Dialog
        header="Dokument hochladen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <FileUpload
            mode="basic"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            auto
            removeIcon=""
            customUpload
            uploadHandler={handleUpload}
            chooseLabel="Bild auswählen oder ablegen"
          />
          <InputText onChange={(e) => setDocumentName(e.target.value)} value={documentName} />
          <Button
            disabled={!documentFile || !documentName || submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Dokument hochladen"
            onClick={uploadDocument}
          />
        </div>
      </Dialog>
      <div className="row space-between">
        {hl ? <h1>Dokumente</h1> : <h3>Dokumente</h3>}
        <DocumentUploader folder={selectedFolder} onUpload={updateDocuments} owner={owner} />
      </div>
      <DividerBlock height={2} />
      <ContextMenu model={items} ref={folderMenu} breakpoint="767px" />
      {selectedFolder && (
        <Button
          icon="pi pi-arrow-left"
          label="Zurück"
          text
          onClick={() => setSelectedFolder(null)}
          style={{ width: 'fit-content' }}
        />
      )}
      <div
        className={styles.documentGrid}
        onContextMenu={(e) => folderMenu.current?.show(e)}
        style={{ flexGrow: 1 }}
      >
        {pendingFolder && (
          <div className={styles.wrapper}>
            <Image alt="" height={48} src="/icons/folder.svg" width={48} />
            <input
              ref={pendingInputRef}
              value={pendingFolder.name}
              onChange={(e) => setPendingFolder({ ...pendingFolder, name: e.target.value })}
              onBlur={confirmFolder}
              onKeyDown={(e) => {
                if (e.key === 'Enter') pendingInputRef.current?.blur();
                if (e.key === 'Escape') setPendingFolder(null);
              }}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.9rem',
                padding: 0,
                width: '100%',
                background: 'transparent',
              }}
            />
          </div>
        )}

        {visibleFolders.map((folder) => (
          <DocumentFolderBox
            backgroundColor={backgroundColor}
            folder={folder}
            key={folder.id}
            onClick={() => setSelectedFolder(folder.id)}
            onDelete={deleteFolder}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => dropOnFolder(folder.id)}
          />
        ))}
        {visibleDocuments.map((d, i) => (
          <DocumentFile
            document={d}
            draggable
            key={i}
            onClick={() => selectDocument(d)}
            onDragStart={() => setDraggingDocument(d)}
            onDragEnd={() => setDraggingDocument(null)}
          />
        ))}
      </div>
    </div>
  );
}
