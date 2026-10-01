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
import { ContextMenu } from 'primereact/contextmenu';
import Image from 'next/image';
import styles from './Documents.module.css';
import { Toast } from 'primereact/toast';
import { folderCreate } from '@/app/actions/folders';

interface Props {
  documents: Document[];
  folders: DocumentFolder[];
  loading?: boolean;
  onDelete: () => void;
  onSelectDoc: (value: Document) => void;
  onSelectFolder: (value: DocumentFolder) => void;
  owner: string;
}

export default function DocumentExplorer({
  documents,
  folders,
  loading,
  onDelete,
  onSelectDoc,
  onSelectFolder,
  owner,
}: Props) {
  const folderMenu = useRef<ContextMenu | null>(null);
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  // STATES
  const [draggingDocument, setDraggingDocument] = useState<Document | null>(null);

  // FOLDERS
  const [pendingFolder, setPendingFolder] = useState<{ id: string; name: string } | null>(null);
  const pendingInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // CONTEXT MENU FOLDERS
  const items = [
    {
      label: 'Neuen Ordner anlegen',
      command: () => createFolder(),
    },
  ];

  const visibleFolders = folders.filter((f) => f.parent === selectedFolder);
  const visibleDocuments = documents.filter((d) => (d as any).folder === selectedFolder);

  // ACTIONS
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
    } catch (err) {
      console.error(err);
    } finally {
      setPendingFolder(null);
    }
  };

  const createFolder = async () => {
    const tempId = 'pending-' + Date.now();
    setPendingFolder({ id: tempId, name: '' });

    setTimeout(() => pendingInputRef.current?.focus(), 50);
  };

  const deleteFolder = async () => {};

  const dropOnFolder = async (folderId: string) => {
    if (!draggingDocument) return;

    try {
      await documentUpdate({ folder: folderId }, draggingDocument.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDraggingDocument(null);
    }
  };

  return (
    <div className="column height-100">
      <ContextMenu model={items} ref={folderMenu} breakpoint="767px" />
      {selectedFolder && (
        <Button
          icon="pi pi-arrow-left"
          label="Zurück"
          text
          onClick={() => {
            setSelectedFolder(null);
            onSelectFolder(null as any); // je nach Typ ggf. Props anpassen auf `DocumentFolder | null`
          }}
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
            folder={folder}
            key={folder.id}
            onClick={() => {
              setSelectedFolder(folder.id); // ← intern navigieren
              onSelectFolder(folder as DocumentFolder); // ← Parent informieren (z.B. für Upload-Zielordner)
            }}
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
            loading={loading}
            onClick={() => onSelectDoc(d as Document)}
            onDragStart={() => setDraggingDocument(d)}
            onDragEnd={() => setDraggingDocument(null)}
          />
        ))}
      </div>
    </div>
  );
}
