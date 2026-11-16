'use client';

import styles from './Documents.module.css';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import { InputText } from 'primereact/inputtext';
import { certificateDelete, certificateUpdate } from '@/app/actions/certificates';
import { zertifikatUrl } from '@/app/actions/certificates/url';
import { Zertifikat } from '@/app/types/certificates';

interface Props {
  certificate: Zertifikat;
  onChange?: () => void;
  onDelete: () => void;
}

export default function CertificateFile({ certificate, onChange, onDelete }: Props) {
  const certificateActions = useRef<ContextMenu | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState('');

  const items = [
    { label: 'Herunterladen', icon: 'pi pi-download', command: () => certificateDownload() },
    {
      label: 'Jahr ändern',
      icon: 'pi pi-pencil',
      command: () => {
        setEditingName(String(certificate.year ?? ''));
        setEditing(true);
        setTimeout(() => certificateInputRef.current?.select(), 50);
      },
    },
    { label: 'Löschen', icon: 'pi pi-trash', command: () => deleteCertificate() },
  ];

  // ACTIONS
  const certificateDownload = async () => {
    const res = await zertifikatUrl(certificate.id);
    if (res.error || !res.url) {
      console.error(res.error);
      alert(res.error ?? 'Download fehlgeschlagen.');
      return;
    }
    window.location.assign(res.url); // signierter Link mit Download-Header
  };

  const confirmEdit = async () => {
    setEditing(false);
    const jahr = Number(editingName);
    if (!jahr || jahr === certificate.year) return;
    try {
      await certificateUpdate(certificate.id, { year: jahr });
      onChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCertificate = async () => {
    await certificateDelete(certificate.id);
    onDelete();
  };

  return (
    <>
      <ContextMenu model={items} ref={certificateActions} breakpoint="767px" />
      <div
        className={styles.wrapper}
        onContextMenu={(e) => certificateActions.current?.show(e)}
        onDoubleClick={certificateDownload}
        style={{ backgroundColor: 'var(--button-secondary)' }}
      >
        <Image alt="" height={48} src="/icons/pfx.svg" width={48} />
        {editing ? (
          <InputText
            autoFocus
            inputMode="numeric"
            onBlur={confirmEdit}
            onChange={(e) => setEditingName(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') certificateInputRef.current?.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
            ref={certificateInputRef}
            style={{ fontSize: 11 }}
            value={editingName}
          />
        ) : (
          <span style={{ fontSize: 11 }}>{certificate.name}</span>
        )}
      </div>
    </>
  );
}