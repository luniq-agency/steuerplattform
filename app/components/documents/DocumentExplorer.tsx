'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { documentUpdate } from '@/app/actions/documents';
import { folderCreate } from '@/app/actions/folders';
import { Dokument, DokumentOrdner } from '@/app/types/docs';
import { formatDate } from '@/app/utils/formats';
import { DateiIcon, dateiTypLabel, OrdnerIcon } from '@/app/utils/fileIcons';
import styles from './Documents.module.css';
import Row from '../layout/Row';
import { User } from '@/app/types/Database';

interface Props {
  documents: Dokument[];
  folders: DokumentOrdner[];
  loading?: boolean;
  onDelete: () => void;
  onSelectDoc: (value: Dokument) => void;
  onSelectFolder: (value: DokumentOrdner | null) => void;
  owner: number;
  showOwner?: boolean;
  users?: User[];
}

type ExplorerRow =
  | { kind: 'pending'; key: string }
  | { kind: 'folder'; key: string; item: DokumentOrdner }
  | { kind: 'file'; key: string; item: Dokument };

export default function DocumentExplorer({
  documents,
  folders,
  loading,
  onSelectDoc,
  onSelectFolder,
  owner,
  showOwner = false,
  users
}: Props) {
  const folderMenu = useRef<ContextMenu | null>(null);
  const pendingInputRef = useRef<HTMLInputElement | null>(null);

  // STATES
  const [draggingDocument, setDraggingDocument] = useState<Dokument | null>(null);
  const [dropTarget, setDropTarget] = useState<string | number | null>(null);
  const [pendingFolder, setPendingFolder] = useState<{ name: string } | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | number | null>(null);

  // CONTEXT MENU
  const items = [{ label: 'Neuen Ordner anlegen', command: () => createFolder() }];

  // ROWS: Ordner zuerst, dann Dateien, jeweils alphabetisch
  const rows: ExplorerRow[] = [
    ...(pendingFolder ? [{ kind: 'pending' as const, key: 'pending' }] : []),
    ...folders
      .filter((f) => f.parent === selectedFolder)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
      .map((f) => ({ kind: 'folder' as const, key: `folder-${f.id}`, item: f })),
    ...documents
      .filter((d) => d.ordner === selectedFolder)
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'de'))
      .map((d) => ({ kind: 'file' as const, key: `file-${d.id}`, item: d })),
  ];

  // NAVIGATION
  const openFolder = (folder: DokumentOrdner) => {
    setSelectedFolder(folder.id);
    onSelectFolder(folder);
  };

  const goUp = () => {
    const current = folders.find((f) => f.id === selectedFolder);
    const parent = folders.find((f) => f.id === current?.parent) ?? null;
    setSelectedFolder(parent?.id ?? null);
    onSelectFolder(parent);
  };

  // ACTIONS
  const createFolder = () => {
    setPendingFolder({ name: '' });
    setTimeout(() => pendingInputRef.current?.focus(), 50);
  };

  const confirmFolder = async () => {
    if (!owner || !pendingFolder) return;
    const name = pendingFolder.name.trim() || 'Neuer Ordner';
    try {
      await folderCreate({ name, parent: selectedFolder, user: owner });
    } catch (err) {
      console.error(err);
    } finally {
      setPendingFolder(null);
    }
  };

  const dropOnFolder = async (folderId: string | number) => {
    if (!draggingDocument) return;
    try {
      await documentUpdate({ ordner: folderId }, draggingDocument.id);
    } catch (err) {
      console.error(err);
    } finally {
      setDraggingDocument(null);
      setDropTarget(null);
    }
  };

  // TEMPLATES
  const nameTemplate = (row: ExplorerRow) => {
    if (row.kind === 'pending') {
      return (
        <div className={styles.nameCell}>
          <Row alignItems="center" gap={8}>
            <OrdnerIcon />
            <input
              ref={pendingInputRef}
              className={styles.nameInput}
              placeholder="Neuer Ordner"
              value={pendingFolder?.name ?? ''}
              onChange={(e) => setPendingFolder({ name: e.target.value })}
              onBlur={confirmFolder}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') pendingInputRef.current?.blur();
                if (e.key === 'Escape') setPendingFolder(null);
              }}
            />
          </Row>
        </div>
      );
    }

    if (row.kind === 'folder') {
      const id = row.item.id;
      return (
        <div
          className={`${styles.nameCell} ${dropTarget === id ? styles.dropTarget : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDropTarget(id);
          }}
          onDragLeave={() => setDropTarget(null)}
          onDrop={() => dropOnFolder(id)}
        >
          <Row alignItems="center" gap={8}>
            <OrdnerIcon />
            <span>{row.item.name}</span>
          </Row>
        </div>
      );
    }

    return (
      <div
        className={styles.nameCell}
        draggable
        onDragStart={() => setDraggingDocument(row.item)}
        onDragEnd={() => setDraggingDocument(null)}
      >
        <Row alignItems="center" gap={8}>
          <DateiIcon type={row.item.type} name={row.item.name} />
          <span>{row.item.name}</span>
        </Row>
      </div>
    );
  };

  const dateTemplate = (row: ExplorerRow) =>
    row.kind === 'pending' || !row.item.created_at ? '–' : formatDate(row.item.created_at);

  const ownerTemplate = (row: ExplorerRow) => {
    if (row.kind != 'file' || !users) return;
    const owner = users?.find((u) => u.id == row.item.user);
    if (!owner) return;
    return <span>{owner.nachname}, {owner.vorname}</span>
  }

  const typeTemplate = (row: ExplorerRow) => {
    if (row.kind === 'file') return dateiTypLabel(row.item.type, row.item.name);
    return 'Ordner';
  };

  return (
    <div className="column height-100">
      <ContextMenu model={items} ref={folderMenu} breakpoint="767px" />

      {selectedFolder !== null && (
        <Button icon="pi pi-arrow-left" label="Zurück" onClick={goUp} style={{ width: 'fit-content' }} text />
      )}

      <div onContextMenu={(e) => folderMenu.current?.show(e)} style={{ flexGrow: 1 }}>
        <DataTable
          dataKey="key"
          emptyMessage="Dieser Ordner ist leer. Rechtsklick → Neuen Ordner anlegen."
          loading={loading}
          onRowClick={(e) => {
            const row = e.data as ExplorerRow;
            if (row.kind === 'folder') openFolder(row.item);
            if (row.kind === 'file') onSelectDoc(row.item);
          }}
          rowClassName={() => styles.explorerRow}
          rowHover
          value={rows}
        >
          <Column body={nameTemplate} header="Dateiname" sortable sortField='name' />
          {showOwner && <Column body={ownerTemplate} header="Besitzer" sortable sortField='name' />}
          <Column body={dateTemplate} header="Hochgeladen am" sortable sortField="created_at" style={{ width: 180 }} />
          <Column body={typeTemplate} header="Dateityp" style={{ width: 120 }} />
        </DataTable>
      </div>
    </div>
  );
}