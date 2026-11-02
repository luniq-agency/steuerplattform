'use client';

import { ContextMenu } from 'primereact/contextmenu';
import { Document } from '@/app/types/Database';
import styles from './Documents.module.css';
import { useRef } from 'react';
import Image from 'next/image';
import { document_options } from '@/app/constants/Constants';
import { Skeleton } from 'primereact/skeleton';
import { Dokument } from '@/app/types/docs';

interface Props {
  document: Dokument;
  draggable?: boolean;
  loading?: boolean;
  onClick: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export default function DocumentFile({
  document,
  draggable,
  loading,
  onClick,
  onDragStart,
  onDragEnd,
}: Props) {
  const fileMenu = useRef<ContextMenu | null>(null);

  const items = [
    {
      label: 'Umbenennen',
    },
    {
      label: 'Löschen',
      command: () => deleteFile(),
    },
  ];

  const deleteFile = async () => {};

  const fileIcon = document.type ? document_options.find((t) => t.value === document.type)?.icon : '/icons/image.svg';

  if (!fileIcon) return;

    if (loading) return (
    <Skeleton height="140px" width="100%" />
  )

  return (
    <div
      className={styles.wrapper}
      draggable={draggable}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ backgroundColor: 'var(--background)' }}
    >
      <Image alt="" height={48} src={fileIcon} width={48} />
      <span style={{ fontSize: 11 }}>{document.name}</span>
    </div>
  );
}

export function DocumentListItem({
  document,
  draggable,
  onClick,
  onDragStart,
  onDragEnd,
}: Props) {
  const fileMenu = useRef<ContextMenu | null>(null);

  const items = [
    {
      label: 'Umbenennen',
    },
    {
      label: 'Löschen',
      command: () => deleteFile(),
    },
  ];

  const deleteFile = async () => {};

  const fileIcon = document_options.find((t) => t.value === document.type)?.icon || '/icons/image.svg' ;

  return (
    <div
      className="row gap-xs align-center"
      draggable={draggable}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{padding: "0.25rem 0rem"}}
    >
      <Image alt="" height={16} src={fileIcon} width={16} />
      <span style={{ fontSize: 14 }}>{document.name}</span>
    </div>
  );
}