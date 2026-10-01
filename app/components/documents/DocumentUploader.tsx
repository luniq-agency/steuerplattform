'use client';

import { documentCreate } from '@/app/actions/documents';
import { uploadFileDirectly } from '@/app/actions/media/uploads';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useRef, useState } from 'react';
import { FileUploader } from '../forms/Uploaders';
import { sanitizeFileName } from '@/app/utils/sanitize';
import { PrimaryButton, SecondaryButton } from '../buttons/Buttons';
import { Toast } from 'primereact/toast';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface Props {
  folder: string | null;
  onUpload: () => void;
  owner: string | number;
}

export default function DocumentUploader({ folder, onUpload, owner }: Props) {
  const toast = useRef<Toast | null>(null);

  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [documentFile, setDocumentFile] = useState<{ file: File } | null>(null);
  const [documentFileType, setDocumentFileType] = useState('');
  const [documentName, setDocumentName] = useState('');

  const cancel = () => {
    setVisible(false);
    setDocumentFile(null);
    setDocumentFileType('');
    setDocumentName('');
  };

  const handleUpload = (file: File, fileType: string) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.current?.show({
        severity: 'error',
        summary: 'Datei zu groß',
        detail: `Die Datei ist ${(file.size / 1024 / 1024).toFixed(1)} MB groß. Maximal erlaubt sind 20 MB.`,
      });
      return; // ← Upload wird gar nicht erst gesetzt/gestartet
    }

    setDocumentFile({ file });
    setDocumentFileType(fileType);
  };

  const uploadDocument = async () => {
    if (!documentFile || !owner) return;
    setSubmitting(true);

    try {
      const sanitized = sanitizeFileName(documentFile.file.name);
      const path = `${owner}/${sanitized}`;

      const url = await uploadFileDirectly(documentFile.file, path);

      await documentCreate({
        document_file: url,
        document_name: documentName,
        file_type: documentFileType,
        folder: folder || undefined,
        user: String(owner),
      });

      setDocumentFile(null);
      setDocumentName('');
      onUpload();
    } catch (err) {
      console.error('Upload Fehler:', err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Das Dokument konnte nicht hochgeladen werden.',
      });
    } finally {
      setSubmitting(false);
      setVisible(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        header="Dokument hochladen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <FileUploader
            label={documentFile?.file.name || 'Datei auswählen'}
            onUpload={handleUpload}
          />
          <InputText
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Name (z. B. Steuererklärung 2024)"
            value={documentName}
          />
          <div className="row gap-s width-100 space-between">
            <SecondaryButton label="Abbrechen" onClick={cancel} />
            <PrimaryButton
              disabled={!documentFile || !documentName || submitting}
              label={submitting ? 'Wird hochgeladen…' : 'Hochladen'}
              onClick={uploadDocument}
            />
          </div>
        </div>
      </Dialog>
      <Button
        className="button-secondary"
        icon="pi pi-upload"
        label="Dokument hochladen"
        onClick={() => setVisible(true)}
      />
    </>
  );
}