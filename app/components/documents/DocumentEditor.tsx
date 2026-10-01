'use client';

import { Document, User } from '@/app/types/Database';
import { TextInputLabel } from '@/app/components/forms/FormElements';
import { document_options } from '@/app/constants/Constants';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { documentUpdate } from '@/app/actions/documents';
import { Toast } from 'primereact/toast';
import Image from 'next/image';
import { imageUploadReplace } from '@/app/actions/image';
import { useRouter } from 'next/navigation';
import DocumentPreviewer from './DocumentPreviewer';

interface Props {
  document: Document;
  preview?: boolean;
  onSave: () => void;
  users?: User[];
}

export default function DocumentEditor({ document, onSave, preview, users }: Props) {
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  const [rotation, setRotation] = useState(0);
  const [savingRotation, setSavingRotation] = useState(false);

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const saveRotation = async () => {
    setSavingRotation(true);
    try {
      // Canvas verwenden um das Bild zu drehen und als Blob zu speichern
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.src = document.document_file;

      await new Promise((resolve) => (img.onload = resolve));

      const canvas = window.document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const isRotated90or270 = rotation % 180 !== 0;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/webp')
      );

      const file = new File([blob], 'rotated.webp', { type: 'image/webp' });
      await imageUploadReplace(file, document.document_file, document.id);
      setRotation(0);
      onSave();
      router.refresh();
      toast.current?.show({ severity: 'success', summary: 'Bild gespeichert' });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingRotation(false);
    }
  };

  const [documentName, setDocumentName] = useState('');
  const [documentOwner, setDocumentOwner] = useState('');
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    if (document) {
      setDocumentName(document.document_name);
      setDocumentOwner(document.user);
      setDocumentType(document.file_type);
    }
  }, [document]);

  const updateDocument = async () => {
    const payload = {
      document_name: documentName,
      file_type: documentType,
      user: documentOwner,
    };
    try {
      await documentUpdate(payload, document.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Dokument aktualisiert',
        detail: 'Das Dokument wurde aktualisiert.',
      });
      onSave();
    } catch (err) {
      console.error(err);
    }
  };

  const userOptions = users
    ?.filter((a) => a.user_role === 'client')
    .map((u: User) => ({
      ...u,
      fullName: `${u.user_name_last}, ${u.user_name_first}`,
    }))
    .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last));

  return (
    <div className="row gap-l height-100 width-100">
      <Toast ref={toast} />
      <div className="column gap-m width-100" style={{ maxWidth: 360 }}>
        {document.file_type === 'image' && (
          <div className="column gap-m">
            <Button
              icon="pi pi-refresh"
              label="Drehen"
              onClick={rotateImage}
              severity="secondary"
              size="small"
            />
            {rotation !== 0 && (
              <Button
                icon={savingRotation ? 'pi pi-spinner' : 'pi pi-save'}
                label="Speichern"
                onClick={saveRotation}
                size="small"
                loading={savingRotation}
              />
            )}
          </div>
        )}
        <TextInputLabel
          label="Name des Dokuments"
          onChange={setDocumentName}
          value={documentName}
        />
        <div className="column gap-xs">
          <label>Dokumenttyp</label>
          <Dropdown
            onChange={(e) => setDocumentType(e.value)}
            options={document_options}
            optionLabel="label"
            optionValue="value"
            value={documentType}
          />
        </div>
        {users && (
          <div className="column gap-xs">
            <label>Kunde</label>
            <Dropdown
              filter
              filterPlaceholder="Suchen"
              onChange={(e) => setDocumentOwner(e.value)}
              optionLabel="fullName"
              optionValue="id"
              options={userOptions}
              value={documentOwner}
            />
          </div>
        )}
        <Button label="Änderungen speichern" onClick={updateDocument} />
      </div>
      <div style={{ width: '100%', overflow: 'hidden' }}>
        {document.file_type !== 'image' ? (
          <DocumentPreviewer doc={document} />
        ) : (
          <div style={{ height: '100%', objectFit: 'cover', position: 'relative', width: '100%' }}>
            <Image
              alt=""
              fill={true}
              src={document?.document_file}
              style={{
                objectFit: 'contain',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
