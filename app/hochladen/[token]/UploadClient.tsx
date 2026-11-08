'use client';

import { useRef, useState } from 'react';
import { CheckCircle2, Loader2, Upload, X, XCircle } from 'lucide-react';
import { createClient } from '@/app/utils/supabase/client';
import {
  uploadAbschliessen,
  uploadCodeAnfordern,
  uploadCodeBestaetigen,
  uploadVorbereiten,
} from '@/app/actions/uploadLink';

const BUCKET = 'dokumente'; // ← muss zum Bucket in app/actions/uploadLink.ts passen
const MAX_MB = 20;

type Status = 'bereit' | 'laeuft' | 'fertig' | 'fehler';
type Eintrag = { id: string; file: File; name: string; status: Status };

interface Props {
  token: string;
  vorname: string;
  emailHinweis: string | null;
  verifiziert: boolean;
  vorgangTitel: string | null;
  nachricht: string | null;
}

const ohneEndung = (n: string) => n.replace(/\.[^.]+$/, '');

export default function UploadClient({ token, vorname, emailHinweis, nachricht, verifiziert: startVerifiziert, vorgangTitel }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [schritt, setSchritt] = useState<'email' | 'code' | 'upload' | 'fertig'>(startVerifiziert ? 'upload' : 'email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [hinweis, setHinweis] = useState('');
  const [fehler, setFehler] = useState('');
  const [laeuft, setLaeuft] = useState(false);
  const [dateien, setDateien] = useState<Eintrag[]>([]);
  const [anzahlFertig, setAnzahlFertig] = useState(0);

  // ---------- E-Mail & Code ----------

  const codeAnfordern = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler('');
    setLaeuft(true);
    const res = await uploadCodeAnfordern(token, email);
    setLaeuft(false);
    if (res.error) return setFehler(res.error);
    setHinweis(res.hinweis ?? '');
    setSchritt('code');
  };

  const codeBestaetigen = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler('');
    setLaeuft(true);
    const res = await uploadCodeBestaetigen(token, code);
    setLaeuft(false);
    if (res.error) return setFehler(res.error);
    setSchritt('upload');
  };

  // ---------- Dateien ----------

  const hinzufuegen = (liste: FileList | null) => {
    if (!liste?.length) return;
    const neu = Array.from(liste)
      .filter((f) => f.size <= MAX_MB * 1024 * 1024)
      .map((file) => ({ id: crypto.randomUUID(), file, name: ohneEndung(file.name), status: 'bereit' as Status }));
    if (neu.length < liste.length) setFehler(`Dateien über ${MAX_MB} MB wurden nicht hinzugefügt.`);
    setDateien((prev) => [...prev, ...neu].slice(0, 20));
    if (inputRef.current) inputRef.current.value = '';
  };

  const setStatus = (id: string, status: Status) =>
    setDateien((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

  const hochladen = async () => {
    const offen = dateien.filter((d) => d.status !== 'fertig');
    if (!offen.length) return;
    setFehler('');
    setLaeuft(true);

    const vorbereitet = await uploadVorbereiten(
      token,
      offen.map((d) => ({ name: d.file.name, typ: d.file.type, groesse: d.file.size }))
    );
    if (vorbereitet.error) {
      setLaeuft(false);
      return setFehler(vorbereitet.error);
    }

    const supabase = createClient();
    const fertig: { pfad: string; name: string; typ: string }[] = [];

    for (let i = 0; i < offen.length; i++) {
      const d = offen[i];
      const ziel = vorbereitet.ziele?.[i];
      if (!ziel) { setStatus(d.id, 'fehler'); continue; }
      setStatus(d.id, 'laeuft');
      const { error } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(ziel.pfad, ziel.token, d.file, { contentType: d.file.type });
      if (error) {
        console.error(error);
        setStatus(d.id, 'fehler');
      } else {
        setStatus(d.id, 'fertig');
        fertig.push({ pfad: ziel.pfad, name: d.name, typ: d.file.type });
      }
    }

    if (fertig.length) {
      const res = await uploadAbschliessen(token, fertig);
      if (res.error) setFehler(res.error);
      else setAnzahlFertig((n) => n + (res.anzahl ?? 0));
    }

    setLaeuft(false);
    setDateien((prev) => prev.filter((d) => d.status !== 'fertig'));
    if (fertig.length === offen.length) setSchritt('fertig');
    else setFehler('Einige Dateien konnten nicht hochgeladen werden. Du kannst es erneut versuchen.');
  };

  // ---------- Darstellung ----------

  const feld: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1px solid #e5e5e5',
    borderRadius: 8,
    font: 'inherit',
  };
  const knopf: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: 'none',
    borderRadius: 8,
    background: '#1f1f1f',
    color: '#fff',
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    opacity: laeuft ? 0.6 : 1,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ margin: 0 }}>Dokumente hochladen</h1>
      {vorgangTitel && <p style={{ margin: 0, opacity: 0.7 }}>für: {vorgangTitel}</p>}

      {schritt === 'email' && (
        <form onSubmit={codeAnfordern} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0 }}>
            Hallo{vorname ? ` ${vorname}` : ''}, bitte bestätige zuerst deine E-Mail-Adresse
            {emailHinweis ? ` (${emailHinweis})` : ''}. Wir schicken dir dann einen Code.
          </p>
          <input
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Deine E-Mail-Adresse"
            required
            style={feld}
            type="email"
            value={email}
          />
          <button disabled={laeuft || !email} style={knopf} type="submit">
            {laeuft ? 'Wird gesendet …' : 'Code anfordern'}
          </button>
        </form>
      )}

      {schritt === 'code' && (
        <form onSubmit={codeBestaetigen} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0 }}>{hinweis} Gib den 6-stelligen Code hier ein.</p>
          <input
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            required
            style={{ ...feld, fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
            value={code}
          />
          <button disabled={laeuft || code.length !== 6} style={knopf} type="submit">
            {laeuft ? 'Wird geprüft …' : 'Bestätigen'}
          </button>
          <button
            onClick={() => {
              setSchritt('email');
              setCode('');
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            type="button"
          >
            Andere E-Mail-Adresse eingeben
          </button>
        </form>
      )}

      {schritt === 'upload' && (
        <>
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              hinzufuegen(e.dataTransfer.files);
            }}
            style={{ border: '2px dashed #e5e5e5', borderRadius: 12, cursor: 'pointer', padding: 32, textAlign: 'center' }}
          >
            {nachricht && (
              <div style={{ background: '#f6f6f4', borderLeft: '3px solid #1f1f1f', borderRadius: 4, padding: '12px 16px', whiteSpace: 'pre-line' }}>
                {nachricht}
              </div>
            )}
            <Upload size={24} />
            <p style={{ margin: '8px 0 4px' }}>Dateien hierher ziehen oder antippen</p>
            <span style={{ fontSize: 13, opacity: 0.6 }}>PDF, Fotos, Word oder Excel · je max. {MAX_MB} MB</span>
            <input
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.xls,.xlsx"
              hidden
              multiple
              onChange={(e) => hinzufuegen(e.target.files)}
              ref={inputRef}
              type="file"
            />
          </div>

          {dateien.map((d) => (
            <div key={d.id} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
              <input
                disabled={laeuft}
                onChange={(e) => setDateien((prev) => prev.map((x) => (x.id === d.id ? { ...x, name: e.target.value } : x)))}
                style={{ ...feld, flex: 1, padding: '8px 10px' }}
                value={d.name}
              />
              {d.status === 'laeuft' && <Loader2 className="spin" size={18} />}
              {d.status === 'fertig' && <CheckCircle2 color="#00c875" size={18} />}
              {d.status === 'fehler' && <XCircle color="#e2445c" size={18} />}
              {!laeuft && (
                <button
                  aria-label="Entfernen"
                  onClick={() => setDateien((prev) => prev.filter((x) => x.id !== d.id))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}

          <button disabled={laeuft || !dateien.length} onClick={hochladen} style={knopf} type="button">
            {laeuft ? 'Wird hochgeladen …' : dateien.length > 1 ? `${dateien.length} Dateien hochladen` : 'Hochladen'}
          </button>
        </>
      )}

      {schritt === 'fertig' && (
        <div style={{ textAlign: 'center' }}>
          <CheckCircle2 color="#00c875" size={40} />
          <h2>Vielen Dank!</h2>
          <p>
            {anzahlFertig} {anzahlFertig === 1 ? 'Dokument wurde' : 'Dokumente wurden'} sicher übermittelt. Deine Kanzlei
            wurde benachrichtigt.
          </p>
          <button onClick={() => setSchritt('upload')} style={{ ...knopf, background: '#f4f4f2', color: '#1f1f1f' }} type="button">
            Weitere Dokumente hochladen
          </button>
        </div>
      )}

      {fehler && <p style={{ color: '#b42318', margin: 0 }}>{fehler}</p>}
    </div>
  );
}