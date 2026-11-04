import { File, FileArchive, FileImage, FileSpreadsheet, FileText, Folder, type LucideIcon } from 'lucide-react';

type DateiArt = 'pdf' | 'bild' | 'word' | 'excel' | 'text' | 'archiv' | 'datei';

const ART: Record<DateiArt, { icon: LucideIcon; label: string; farbe: string }> = {
  pdf: { icon: FileText, label: 'PDF', farbe: '#e2445c' },
  bild: { icon: FileImage, label: 'Bild', farbe: '#579bfc' },
  word: { icon: FileText, label: 'Word', farbe: '#2b579a' },
  excel: { icon: FileSpreadsheet, label: 'Excel', farbe: '#217346' },
  text: { icon: FileText, label: 'Text', farbe: '#676879' },
  archiv: { icon: FileArchive, label: 'Archiv', farbe: '#a25ddc' },
  datei: { icon: File, label: 'Datei', farbe: '#676879' },
};

/** Erkennt die Art aus MIME-Typ ("image/png", "application/pdf", "image") oder Dateiendung */
export function dateiArt(type?: string | null, name?: string | null): DateiArt {
  const t = (type ?? '').toLowerCase();
  const ext = name?.includes('.') ? name.split('.').pop()!.toLowerCase() : '';

  if (t.includes('pdf') || ext === 'pdf') return 'pdf';
  if (t.startsWith('image') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'svg'].includes(ext)) return 'bild';
  if (t.includes('word') || t.includes('msword') || ['doc', 'docx'].includes(ext)) return 'word';
  if (t.includes('sheet') || t.includes('excel') || t.includes('csv') || ['xls', 'xlsx', 'csv'].includes(ext)) return 'excel';
  if (t.startsWith('text') || ext === 'txt') return 'text';
  if (t.includes('zip') || t.includes('compressed') || ['zip', 'rar', '7z'].includes(ext)) return 'archiv';
  return 'datei';
}

export function DateiIcon({ type, name, size = 22 }: { type?: string | null; name?: string | null; size?: number }) {
  const { icon: Icon, farbe } = ART[dateiArt(type, name)];
  return <Icon color={farbe} size={size} strokeWidth={1.75} />;
}

export function OrdnerIcon({ size = 22 }: { size?: number }) {
  return <Folder color="#fdab3d" fill="#fdab3d33" size={size} strokeWidth={1.75} />;
}

/** Anzeige für die Spalte „Dateityp“, z. B. "PDF" oder "Bild (PNG)" */
export function dateiTypLabel(type?: string | null, name?: string | null): string {
  const label = ART[dateiArt(type, name)].label;
  const sub = (type ?? '').split('/')[1]?.toUpperCase();
  return label === 'Bild' && sub ? `Bild (${sub})` : label;
}