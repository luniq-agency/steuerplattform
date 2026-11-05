'use client';

import { documentCreate } from '@/app/actions/documents';
import { uploadFileDirectly } from '@/app/actions/media/uploads';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { useRef, useState } from 'react';
import { sanitizeFileName } from '@/app/utils/sanitize';
import { Toast } from 'primereact/toast';
import Button from '../buttons/Button';
import { CheckCircle2, Loader2, Upload, X, XCircle } from 'lucide-react';
import { User } from '@/app/types/Database';
import { SelectLabel } from '../inputs/Select';
import { DateiIcon } from '@/app/utils/fileIcons';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_DATEIEN = 20;

type Status = 'bereit' | 'laeuft' | 'fertig' | 'fehler';
type Eintrag = { id: string; file: File; name: string; status: Status };

interface Props {
  folder: string | number | null;
  onLocalFile?: (file: File, name: string) => void;
  onUpload: () => void;
  owner: string | number;
  onBehalf?: boolean;
  users?: User[];
}

const ohneEndung = (name: string) => name.replace(/\.[^.]+$/, '');

export default function DocumentUploader({ folder, onBehalf, onLocalFile, onUpload, owner, users }: Props) {
  const toast = useRef<Toast | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dateien, setDateien] = useState<Eintrag[]>([]);
  const [selectedUser, setSelectedUser] = useState('');

  const besitzer = onBehalf ? selectedUser : String(owner);

  // ACTIONS
  const cancel = () => {
    if (submitting) return;
    setVisible(false);
    setDateien([]);
    setSelectedUser('');
  };

  const hinzufuegen = (liste: FileList | null) => {
    if (!liste?.length) return;

    const neu: Eintrag[] = [];
    const zuGross: string[] = [];

    for (const file of Array.from(liste)) {
      if (file.size > MAX_FILE_SIZE) {
        zuGross.push(file.name);
        continue;
      }
      neu.push({ id: crypto.randomUUID(), file, name: ohneEndung(file.name), status: 'bereit' });
    }

    if (zuGross.length) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Dateien zu groß',
        detail: `Nicht hinzugefügt (max. 20 MB): ${zuGross.join(', ')}`,
        life: 6000,
      });
    }

    setDateien((prev) => [...prev, ...neu].slice(0, MAX_DATEIEN));
    if (inputRef.current) inputRef.current.value = '';
  };

  const entfernen = (id: string) => setDateien((prev) => prev.filter((d) => d.id !== id));

  const umbenennen = (id: string, name: string) =>
    setDateien((prev) => prev.map((d) => (d.id === id ? { ...d, name } : d)));

  const setStatus = (id: string, status: Status) =>
    setDateien((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

  const alleHochladen = async () => {
    const offen = dateien.filter((d) => d.status === 'bereit' || d.status === 'fehler');
    if (!offen.length || !besitzer) return;

    // Lokaler Modus: nur übergeben, Upload passiert später
    if (onLocalFile) {
      offen.forEach((d) => onLocalFile(d.file, d.name.trim() || d.file.name));
      cancel();
      return;
    }

    setSubmitting(true);
    let fehler = 0;

    // Nacheinander hochladen, damit große Mengen den Server nicht überlasten
    for (const d of offen) {
      setStatus(d.id, 'laeuft');
      try {
        const pfad = `${besitzer}/${Date.now()}-${sanitizeFileName(d.file.name)}`;
        const url = await uploadFileDirectly(d.file, pfad);
        await documentCreate({
          file: url,
          name: d.name.trim() || ohneEndung(d.file.name),
          ordner: folder || undefined,
          type: d.file.type || 'application/octet-stream',
          user: besitzer,
        });
        setStatus(d.id, 'fertig');
      } catch (err) {
        console.error('Upload Fehler:', d.file.name, err);
        setStatus(d.id, 'fehler');
        fehler++;
      }
    }

    setSubmitting(false);
    onUpload();

    if (fehler === 0) {
      toast.current?.show({
        severity: 'success',
        summary: offen.length === 1 ? 'Dokument hochgeladen' : `${offen.length} Dokumente hochgeladen`,
      });
      setVisible(false);
      setDateien([]);
      setSelectedUser('');
    } else {
      // Erfolgreiche aus der Liste nehmen, fehlgeschlagene zum erneuten Versuch behalten
      setDateien((prev) => prev.filter((d) => d.status !== 'fertig'));
      toast.current?.show({
        severity: 'error',
        summary: 'Nicht alle Dokumente hochgeladen',
        detail: `${fehler} von ${offen.length} Dateien sind fehlgeschlagen. Du kannst es erneut versuchen.`,
        life: 8000,
      });
    }
  };

  const clients = (users ?? [])
    .map((a) => ({ ...a, fullName: `${a.nachname}, ${a.vorname}` }))
    .sort((a, b) => (a.nachname ?? '').localeCompare(b.nachname ?? ''));

  const offeneAnzahl = dateien.filter((d) => d.status !== 'fertig').length;
  const kannHochladen = offeneAnzahl > 0 && !submitting && (!onBehalf || !!selectedUser);

  const statusIcon = (s: Status) => {
    if (s === 'laeuft') return <Loader2 className="spin" size={18} />;
    if (s === 'fertig') return <CheckCircle2 color="#00c875" size={18} />;
    if (s === 'fehler') return <XCircle color="#e2445c" size={18} />;
    return null;
  };

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        draggable={false}
        header="Dokumente hochladen"
        onHide={cancel}
        style={{ maxWidth: 560, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          {onBehalf && (
            <SelectLabel
              filter
              label="Mandant"
              onChange={setSelectedUser}
              optionLabel="fullName"
              optionValue="id"
              options={clients}
              value={selectedUser}
            />
          )}

          {/* Ablagefläche */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragLeave={() => setDragOver(false)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              hinzufuegen(e.dataTransfer.files);
            }}
            style={{
              border: `2px dashed ${dragOver ? 'var(--foreground, #1f1f1f)' : 'var(--border-color, #e5e5e5)'}`,
              borderRadius: 12,
              cursor: 'pointer',
              padding: 24,
              textAlign: 'center',
              transition: 'border-color 150ms ease',
            }}
          >
            <Upload size={22} />
            <p style={{ margin: '8px 0 4px' }}>Dateien hierher ziehen oder klicken</p>
            <span className="text-meta">Mehrere Dateien möglich, je max. 20 MB</span>
            <input hidden multiple onChange={(e) => hinzufuegen(e.target.files)} ref={inputRef} type="file" />
          </div>

          {/* Dateiliste */}
          {dateien.length > 0 && (
            <div className="column gap-s" style={{ maxHeight: 320, overflowY: 'auto' }}>
              {dateien.map((d) => (
                <div className="row gap-s" key={d.id} style={{ alignItems: 'center' }}>
                  <DateiIcon name={d.file.name} type={d.file.type} />
                  <InputText
                    disabled={submitting || d.status === 'fertig'}
                    onChange={(e) => umbenennen(d.id, e.target.value)}
                    style={{ flex: 1 }}
                    value={d.name}
                  />
                  {statusIcon(d.status)}
                  {!submitting && d.status !== 'fertig' && (
                    <button
                      aria-label={`${d.file.name} entfernen`}
                      onClick={() => entfernen(d.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                      type="button"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="row gap-s width-100 space-between">
            <Button disabled={submitting} label="Abbrechen" mode="tertiary" onClick={cancel} size="medium" />
            <Button
              disabled={!kannHochladen}
              label={
                submitting
                  ? 'Wird hochgeladen …'
                  : offeneAnzahl > 1
                    ? `${offeneAnzahl} Dokumente hochladen`
                    : 'Hochladen'
              }
              mode="secondary"
              onClick={alleHochladen}
              size="medium"
            />
          </div>
        </div>
      </Dialog>
      <Button icon={Upload} label="Dokumente hochladen" mode="secondary" onClick={() => setVisible(true)} size="small" />
    </>
  );
}