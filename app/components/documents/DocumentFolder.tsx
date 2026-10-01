'use client';

import Image from 'next/image';
import styles from './Documents.module.css';
import type { DocumentFolder } from '@/app/types/Database';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef, useState } from 'react';
import { folderDelete, folderUpdate } from '@/app/actions/folders';

interface Props {
  backgroundColor?: string;
  folder: DocumentFolder;
  onClick: () => void;
  onDelete: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
}

export default function DocumentFolderBox({
  backgroundColor,
  folder,
  onClick,
  onDelete,
  onDragOver,
  onDrop,
}: Props) {
  const [editing, setEditing] = useState(false);

  const [dragOver, setDragOver] = useState(false);

  const [folderName, setFolderName] = useState('');
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const op = useRef<OverlayPanel | null>(null);

  const editName = () => {
    setEditing(true);
    setTimeout(() => folderInputRef.current?.focus(), 50);
  };

  const confirmEdit = async () => {
    const payload = {
      name: folderName,
    };

    try {
      await folderUpdate(folder.id, payload);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFolder = async () => {
    try {
      await folderDelete(folder.id);
      onDelete();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className={styles.wrapper}
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
        onDragOver?.(e);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => {
        setDragOver(false);
        onDrop?.();
      }}
      style={{ backgroundColor }}
    >
      <OverlayPanel ref={op}>
        <div className="column">
          <Button
            className="button-context"
            label="Umbennen"
            onClick={(e) => {
              e.stopPropagation();
              editName();
            }}
          />
          <Button
            className="button-context"
            label="Löschen"
            onClick={(e) => {
              e.stopPropagation();
              deleteFolder();
            }}
          />
        </div>
      </OverlayPanel>
      <div className="row space-between">
        <Image alt="" height={48} src="/icons/folder.svg" width={48} />
        <Button
          className={styles.buttonFolder}
          icon="pi pi-ellipsis-v"
          onClick={(e) => {
            e.stopPropagation();
            op.current?.toggle(e);
          }}
          text
        />
      </div>
      {editing ? (
        <input
          className={styles.folderInput}
          onBlur={confirmEdit}
          onChange={(e) => setFolderName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') folderInputRef.current?.blur();
            if (e.key === 'Escape') setEditing(false);
          }}
          ref={folderInputRef}
          value={folderName}
        />
      ) : (
        <span>{folder.name}</span>
      )}
    </div>
  );
}

export function FolderListItem({
  backgroundColor,
  folder,
  onClick,
  onDelete,
  onDragOver,
  onDrop,
}: Props) {
  const [editing, setEditing] = useState(false);

  const [dragOver, setDragOver] = useState(false);

  const [folderName, setFolderName] = useState('');
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const op = useRef<OverlayPanel | null>(null);

  const editName = () => {
    setEditing(true);
    setTimeout(() => folderInputRef.current?.focus(), 50);
  };

  const confirmEdit = async () => {
    const payload = {
      name: folderName,
    };

    try {
      await folderUpdate(folder.id, payload);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFolder = async () => {
    try {
      await folderDelete(folder.id);
      onDelete();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      onClick={onClick}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
        onDragOver?.(e);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => {
        setDragOver(false);
        onDrop?.();
      }}
      style={{ padding: '0.5rem 0rem' }}
    >
      <OverlayPanel ref={op}>
        <div className="column">
          <Button
            className="button-context"
            label="Umbennen"
            onClick={(e) => {
              e.stopPropagation();
              editName();
            }}
          />
          <Button
            className="button-context"
            label="Löschen"
            onClick={(e) => {
              e.stopPropagation();
              deleteFolder();
            }}
          />
        </div>
      </OverlayPanel>
      <div className="row gap-xs align-center">
        <Image alt="" height={16} src="/icons/folder.svg" width={16} />
        {editing ? (
          <input
            className={styles.folderInput}
            onBlur={confirmEdit}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') folderInputRef.current?.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
            ref={folderInputRef}
            value={folderName}
          />
        ) : (
          <span style={{ fontSize: 14 }}>{folder.name}</span>
        )}
      </div>
    </div>
  );
}
