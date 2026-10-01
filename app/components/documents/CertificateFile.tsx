'use client';

import { Certificate } from '@/app/types/Database';
import styles from './Documents.module.css';
import Image from 'next/image';
import { useRef, useState } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import { TextInput } from '@react-pdf/renderer';
import { InputText } from 'primereact/inputtext';
import { certificateDelete, certificateUpdate } from '@/app/actions/certificates';
import { InputNumber } from 'primereact/inputnumber';

interface Props {
  certificate: Certificate;
  onDelete: () => void;
}

export default function CertificateFile({ certificate, onDelete}: Props) {
  const certificateActions = useRef<ContextMenu | null>(null);
  const certificateInputRef = useRef<HTMLInputElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState('');

  const items = [
    {
      label: 'Herunterladen',
      command: () => certificateDownload(),
    },
    {
      label: 'Umbenennen',
      command: () => setEditing(true),
    },
    {
      label: 'Löschen',
      command: () => deleteCertificate(),
    },
  ];

  // ACTIONS
  const certificateDownload = () => {
    if (!certificate) return;

    const fileName = `Zertifikat ${certificate.user} ${certificate.year}`;

    const link = document.createElement('a');
    link.href = certificate.file;
    link.download = certificate.user;
    link.target = '_blank';
    link.click();
  };

  const confirmEdit = async () => {
    const payload = {
      year: editingName,
    };

    try {
      await certificateUpdate(certificate.id, payload);
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
        style={{ backgroundColor: 'var(--background)' }}
      >
        <Image alt="" height={48} src="/icons/pfx.svg" width={48} />
        {editing ? (
          <InputText
            onBlur={confirmEdit}
            onChange={(e) => setEditingName(e.target.value || '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') certificateInputRef.current?.blur();
              if (e.key === 'Escape') setEditing(false);
            }}
            style={{ fontSize: 11 }}
            value={editingName}
          />
        ) : (
          <span style={{ fontSize: 11 }}>{certificate.year}</span>
        )}
      </div>
    </>
  );
}
