'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import { useAuth } from '@/app/context/AuthContext';
import { belegVerarbeiten, type BelegVerarbeitet } from '@/app/actions/belege/belege';
import Button from '@/app/components/buttons/Button';

const ERLAUBT = '.pdf,.xml,.jpg,.jpeg,.png,.heic';
const MAX_MB = 15;

interface Props {
  onErkannt: (beleg: BelegVerarbeitet) => void;
}

export default function BelegUpload({ onErkannt }: Props) {
  const { team } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  const hochladen = async (dateien: FileList | null) => {
    if (!dateien?.length || !team) return;
    setFehler(null);
    const supabase = createClient();

    for (const datei of Array.from(dateien)) {
      if (datei.size > MAX_MB * 1024 * 1024) {
        setFehler(`${datei.name} ist größer als ${MAX_MB} MB.`);
        continue;
      }

      setStatus(`${datei.name} wird hochgeladen …`);
      const monat = new Date().toISOString().slice(0, 7);
      const sicher = datei.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const pfad = `${team.id}/${monat}/${crypto.randomUUID()}-${sicher}`;

      // Direkt in Storage hochladen (umgeht das Größenlimit von Server Actions)
      const { error: uploadError } = await supabase.storage
        .from('belege')
        .upload(pfad, datei, { contentType: datei.type || undefined });

      if (uploadError) {
        console.error(uploadError);
        setFehler(`${datei.name} konnte nicht hochgeladen werden.`);
        continue;
      }

      setStatus(`${datei.name} wird ausgelesen …`);
      const result = await belegVerarbeiten(pfad, datei.name, datei.type);

      if (result.error || !result.data) setFehler(result.error ?? 'Unbekannter Fehler.');
      else onErkannt(result.data);
    }

    setStatus(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        hochladen(e.dataTransfer.files);
      }}
      style={{
        border: '2px dashed rgba(0,0,0,0.15)',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ERLAUBT}
        multiple
        hidden
        onChange={(e) => hochladen(e.target.files)}
      />
      <p style={{ marginTop: 0 }}>Belege hierher ziehen oder auswählen</p>
      <p className="text-meta">PDF, E-Rechnung (XRechnung/ZUGFeRD) oder Foto, max. {MAX_MB} MB</p>
      <Button
        disabled={!!status}
        icon={Upload}
        label={status ?? 'Belege auswählen'}
        mode="secondary"
        onClick={() => inputRef.current?.click()}
        size="small"
      />
      {fehler && <p style={{ color: 'var(--red-500, #d32f2f)' }}>{fehler}</p>}
    </div>
  );
}