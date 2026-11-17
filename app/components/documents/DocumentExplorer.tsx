'use client';

import { useRef, useState } from 'react';
import Button from '../buttons/Button';
import { ContextMenu } from 'primereact/contextmenu';
import { DataTable } from 'primereact/datatable';
import { Download } from 'lucide-react';
import { dokumenteDownload } from '@/app/actions/documents/url';
import { dateienHerunterladen } from '@/app/utils/download';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { documentUpdate } from '@/app/actions/documents';
import { folderCreate, folderUpdate } from '@/app/actions/folders';
import { Dokument, DokumentOrdner } from '@/app/types/docs';
import { formatDate } from '@/app/utils/formats';
import { DateiIcon, dateiTypLabel, OrdnerIcon } from '@/app/utils/fileIcons';
import styles from './Documents.module.css';
import Row from '../layout/Row';
import { User } from '@/app/types/Database';
import { ArrowLeft } from 'lucide-react';
import LayoutColumn from "../layout/Column";
import { UserSelectLabel } from '../inputs/select/UserSelectLabel';
import TextInput from '../inputs/TextInput';
import DividerBlock from '../DividerBlock';

interface Props {
  documents: Dokument[];
  folders: DokumentOrdner[];
  loading?: boolean;
  onChange?: () => void;
  onCreate?: () => void;
  onDelete: () => void;
  onSelectDoc: (value: Dokument) => void;
  onSelectFolder: (value: DokumentOrdner | null) => void;
  owner: number;
  showOwner?: boolean;
  users?: User[];
}

type ExplorerRow =
  | { kind: 'folder'; key: string; name: string; item: DokumentOrdner }
  | { kind: 'file'; key: string; name: string; item: Dokument };

// Dialog: neuer Ordner oder Umbenennen
type NameDialog = { modus: 'neu' } | { modus: 'umbenennen'; row: ExplorerRow } | null;

export default function DocumentExplorer({
  documents,
  folders,
  loading,
  onChange,
  onCreate,
  onSelectDoc,
  onSelectFolder,
  owner,
  showOwner = false,
  users,
}: Props) {
  const folderMenu = useRef<ContextMenu | null>(null);
  const rowMenu = useRef<ContextMenu | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const [auswahl, setAuswahl] = useState<ExplorerRow[]>([]);
  const [downloadStatus, setDownloadStatus] = useState('');

  // STATES
  const [contextRow, setContextRow] = useState<ExplorerRow | null>(null);
  const [draggingDocument, setDraggingDocument] = useState<Dokument | null>(null);
  const [dropTarget, setDropTarget] = useState<string | number | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string | number | null>(null);

  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);

  // DIALOG
  const [dialog, setDialog] = useState<NameDialog>(null);
  const [dialogName, setDialogName] = useState('');
  const [dialogFehler, setDialogFehler] = useState('');
  const [saving, setSaving] = useState(false);
  const [namen, setNamen] = useState<Record<string, string>>({}); // lokal geänderte Namen

  // ROWS: Ordner zuerst, dann Dateien, jeweils alphabetisch
  const byName = (a: ExplorerRow, b: ExplorerRow) => a.name.localeCompare(b.name, 'de');

  const rows: ExplorerRow[] = [
    ...folders
      .filter((f) => f.parent === selectedFolder)
      .map((f) => ({ kind: 'folder' as const, key: `folder-${f.id}`, name: namen[`folder-${f.id}`] ?? f.name ?? '', item: f }))
      .sort(byName),
    ...documents
      .filter((d) => d.ordner === selectedFolder)
      .map((d) => ({ kind: 'file' as const, key: `file-${d.id}`, name: namen[`file-${d.id}`] ?? d.name ?? '', item: d }))
      .sort(byName),
  ];

  // CONTEXT MENUS
  const items = [{ label: 'Neuen Ordner anlegen', icon: 'pi pi-folder-plus', command: () => openDialog({ modus: 'neu' }) }];
  const rowItems = [
    { label: 'Umbenennen', icon: 'pi pi-pencil', command: () => contextRow && openDialog({ modus: 'umbenennen', row: contextRow }) },
    {
      label: 'Öffnen',
      icon: 'pi pi-folder-open',
      command: () => {
        if (contextRow?.kind === 'folder') openFolder(contextRow.item);
        if (contextRow?.kind === 'file') onSelectDoc(contextRow.item);
      },
    },
    {
      label: 'Herunterladen',
      icon: 'pi pi-download',
      visible: contextRow?.kind === 'file',
      command: () => contextRow?.kind === 'file' && herunterladen([contextRow.item]),
    },
    { separator: true },
    { label: 'Neuen Ordner anlegen', icon: 'pi pi-folder-plus', command: () => openDialog({ modus: 'neu' }) },
  ];

  // NAVIGATION
  const openFolder = (folder: DokumentOrdner) => {
    setSelectedFolder(folder.id);
    onSelectFolder(folder);
    setAuswahl([]);
  };

  const goUp = () => {
    const current = folders.find((f) => f.id === selectedFolder);
    const parent = folders.find((f) => f.id === current?.parent) ?? null;
    setSelectedFolder(parent?.id ?? null);
    onSelectFolder(parent);
    setAuswahl([]);
  };

  // DIALOG
  const openDialog = (d: Exclude<NameDialog, null>) => {
    setDialog(d);
    setDialogName(d.modus === 'umbenennen' ? d.row.name : '');
    setDialogFehler('');
  };

  const closeDialog = () => {
    setDialog(null);
    setDialogName('');
    setDialogFehler('');
  };

  const confirmDialog = async () => {
    if (!dialog || saving) return;
    const name = dialogName.trim();
    if (!name) return;

    setSaving(true);
    setDialogFehler('');
    try {
      if (dialog.modus === 'neu') {
        const besitzer = showOwner ? selectedOwner?.id : owner;
        if (!besitzer) throw new Error(showOwner ? 'Bitte einen Mandanten auswählen.' : 'Kein Besitzer gesetzt (owner fehlt).');
        await folderCreate({ name, parent: selectedFolder, user: besitzer });
        onCreate?.();
      } else {
        const { row } = dialog;
        if (name !== row.name) {
          if (row.kind === 'folder') await folderUpdate(row.item.id, { name });
          else await documentUpdate({ name }, row.item.id);
          setNamen((prev) => ({ ...prev, [row.key]: name }));
        }
      }
      onChange?.();
      closeDialog();
    } catch (err) {
      console.error(err);
      setDialogFehler(err instanceof Error ? err.message : 'Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  };

  // HERUNTERLADEN
  const herunterladen = async (docs: Dokument[]) => {
    if (!docs.length || downloadStatus) return;
    setDownloadStatus('Wird vorbereitet …');
    try {
      const res = await dokumenteDownload(docs.map((d) => Number(d.id)));
      if (res.error || !res.dateien) throw new Error(res.error);

      const ordnerName = folders.find((f) => f.id === selectedFolder)?.name;
      await dateienHerunterladen(res.dateien, `${ordnerName ?? 'Dokumente'}.zip`, (fertig, gesamt) =>
        setDownloadStatus(`${fertig} / ${gesamt} geladen …`)
      );
      setAuswahl([]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Download fehlgeschlagen.');
    } finally {
      setDownloadStatus('');
    }
  };

  const ausgewaehlteDocs = auswahl.filter((r) => r.kind === 'file').map((r) => r.item as Dokument);

  // VERSCHIEBEN
  const dropOnFolder = async (folderId: string | number) => {
    if (!draggingDocument) return;
    try {
      await documentUpdate({ ordner: folderId }, draggingDocument.id);
      onChange?.();
    } catch (err) {
      console.error(err);
    } finally {
      setDraggingDocument(null);
      setDropTarget(null);
    }
  };

  // TEMPLATES
  const nameTemplate = (row: ExplorerRow) => {
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
            <span>{row.name}</span>
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
          <DateiIcon type={row.item.type} name={row.name} />
          <span>{row.name}</span>
        </Row>
      </div>
    );
  };

  const dateTemplate = (row: ExplorerRow) => (row.item.created_at ? formatDate(row.item.created_at) : '–');

  const ownerTemplate = (row: ExplorerRow) => {
    if (!users) return null;
    const besitzer = users.find((u) => u.id == row.item.user);
    if (!besitzer) return null;
    return <span>{besitzer.nachname}, {besitzer.vorname}</span>;
  };

  const typeTemplate = (row: ExplorerRow) =>
    row.kind === 'file' ? dateiTypLabel(row.item.type, row.item.name) : 'Ordner';

  const dialogTitel =
    dialog?.modus === 'neu'
      ? 'Neuen Ordner anlegen'
      : dialog?.row.kind === 'folder'
        ? 'Ordner umbenennen'
        : 'Dokument umbenennen';

  return (
    <div className="column height-100">
      <ContextMenu model={items} ref={folderMenu} breakpoint="767px" />
      <ContextMenu model={rowItems} ref={rowMenu} breakpoint="767px" />
      <Dialog
        header={dialogTitel}
        onHide={closeDialog}
        onShow={() => {
          nameInputRef.current?.focus();
          nameInputRef.current?.select();
        }}
        style={{ width: 420, maxWidth: '90vw' }}
        visible={!!dialog}
        footer={
          <Row gap={8} justifyContent="end">
            <Button label="Abbrechen" onClick={closeDialog} mode="tertiary" size="small" />
            <Button
              disabled={!dialogName.trim() || saving}
              label={saving ? 'Speichert …' : dialog?.modus === 'neu' ? 'Anlegen' : 'Speichern'}
              mode="secondary"
              onClick={confirmDialog}
              size="small"
            />
          </Row>
        }
      >
        <LayoutColumn gap={16}>
          <TextInput
            inputRef={nameInputRef}
            label="Ordnername"
            onChange={setDialogName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirmDialog();
            }}
            value={dialogName}
          />
          {showOwner && dialog?.modus === 'neu' && (
            <UserSelectLabel
              label="Mandant"
              onChange={setSelectedOwner}
              options={users ?? []}
              value={selectedOwner}
            />
          )}
          {dialogFehler && <p style={{ color: '#b42318', margin: '8px 0 0' }}>{dialogFehler}</p>}
        </LayoutColumn>
      </Dialog>

      <Row alignItems="center" gap={16} justifyContent="start">
        {selectedFolder && <Button icon={ArrowLeft} label="Zurück" onClick={goUp} />}
        {ausgewaehlteDocs.length > 0 && (
          <Row gap={8}>
            <Button
              disabled={!!downloadStatus}
              icon={Download}
              label={
                downloadStatus ||
                (ausgewaehlteDocs.length === 1 ? 'Herunterladen' : `${ausgewaehlteDocs.length} Dokumente herunterladen`)
              }
              mode="tertiary"
              onClick={() => herunterladen(ausgewaehlteDocs)}
              size="small"
            />
            <Button label="Auswahl zurücksetzen" mode='tertiary' onClick={() => setAuswahl([])} size='small' />
          </Row>
        )}
      </Row>

      <DividerBlock height={1} />
      <div
        onContextMenu={(e) => {
          // Rechtsklick auf Ordner/Datei → macht die Tabelle selbst
          if ((e.target as HTMLElement).closest('.kontext-zeile')) return;
          folderMenu.current?.show(e);
        }}
        style={{ flexGrow: 1 }}
      >
        <DataTable
          dataKey="key"
          emptyMessage="Dieser Ordner ist leer."
          isDataSelectable={(e) => (e.data as ExplorerRow).kind === 'file'}
          onSelectionChange={(e) => setAuswahl(e.value as ExplorerRow[])}
          loading={loading}
          onContextMenu={(e) => {
            setContextRow(e.data as ExplorerRow);
            rowMenu.current?.show(e.originalEvent);
          }}
          onRowClick={(e) => {
            const row = e.data as ExplorerRow;
            if (row.kind === 'folder') openFolder(row.item);
            else onSelectDoc(row.item);
          }}
          rowClassName={() => `${styles.explorerRow} kontext-zeile`}
          rowHover
          selection={auswahl}
          selectionMode="checkbox"
          value={rows}
        >
          <Column headerStyle={{ width: 48 }} selectionMode="multiple" />
          <Column body={nameTemplate} header="Dateiname" />
          {showOwner && <Column body={ownerTemplate} header="Besitzer" />}
          <Column body={dateTemplate} header="Hochgeladen am" style={{ width: 180 }} />
          <Column body={typeTemplate} header="Dateityp" style={{ width: 120 }} />
        </DataTable>
      </div>
    </div>
  );
}