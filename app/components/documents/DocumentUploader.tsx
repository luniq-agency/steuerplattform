'use client';

import { documentCreate } from '@/app/actions/documents';
import { uploadFileDirectly } from '@/app/actions/media/uploads';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useRef, useState } from 'react';
import { FileUploader } from '../forms/Uploaders';
import { sanitizeFileName } from '@/app/utils/sanitize';
import { PrimaryButton, SecondaryButton } from '../buttons/Buttons';
import { Toast } from 'primereact/toast';
import Button from '../buttons/Button';
import { Upload } from 'lucide-react';
import BelegUpload from '../belege/BelegUpload';
import { User } from '@/app/types/Database';
import { SelectLabel, UserSelectLabel } from '../inputs/Select';
import { TextInputLabel } from '../forms/FormElements';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

interface Props {
  folder: string | number | null;
  onLocalFile?: (file: File, name: string) => void;
  onUpload: () => void;
  owner: string | number;
  onBehalf?: boolean;
  users?: User[];
}

export default function DocumentUploader({ folder, onBehalf, onLocalFile, onUpload, owner, users }: Props) {
  const toast = useRef<Toast | null>(null);

  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [documentFile, setDocumentFile] = useState<{ file: File } | null>(null);
  const [documentFileType, setDocumentFileType] = useState('');
  const [documentName, setDocumentName] = useState('');

  // SELECTIONS
  const [selectedUser, setSelectedUser] = useState('');

  // ACTIONS
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

      if (onLocalFile) {
        onLocalFile(documentFile.file, documentName || documentFile.file.name);
        cancel();
        return;
      }

      await documentCreate({
        file: url,
        name: documentName,
        ordner: folder || undefined,
        type: documentFileType,
        user: onBehalf ? selectedUser : String(owner),
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

  const clients = users?.map((a) => ({
    ...a,
    fullName: `${a.nachname}, ${a.vorname}`,
  })).sort((a: User, b: User) => a.nachname.localeCompare(b.nachname));

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        draggable={false}
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
          <TextInputLabel
            label="Name des Dokuments"
            onChange={setDocumentName}
            placeholder="Name (z. B. Steuererklärung 2024)"
            value={documentName}
          />
          {onBehalf && <SelectLabel filter label="Mandant" onChange={setSelectedUser} optionLabel='fullName' optionValue='id' options={clients} value={selectedUser} />}
          <div className="row gap-s width-100 space-between">
            <Button label="Abbrechen" onClick={cancel} mode="tertiary" size="medium" />
            <Button
              disabled={!documentFile || !documentName || submitting}
              label={submitting ? 'Wird hochgeladen…' : 'Hochladen'}
              onClick={uploadDocument}
              mode="secondary"
              size="medium"
            />
          </div>
        </div>
      </Dialog>
      <Button
        icon={Upload}
        label="Dokument hochladen"
        mode="secondary"
        onClick={() => setVisible(true)}
        size="small"
      />
    </>
  );
}