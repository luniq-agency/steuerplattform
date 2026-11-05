import type { User } from '@/app/types/Database';

type Pflichtfeld = {
  feld: keyof User;
  label: string;
  // optional: zusätzliche Prüfung, ob der Wert gültig ist
  gueltig?: (wert: string) => boolean;
};

export const PFLICHTFELDER: Pflichtfeld[] = [
  { feld: 'vorname', label: 'Vorname' },
  { feld: 'nachname', label: 'Nachname' },
  { feld: 'geburtsdatum', label: 'Geburtsdatum' },
  { feld: 'email', label: 'E-Mail' },
  { feld: 'telefon', label: 'Telefon' },
  { feld: 'strasse', label: 'Straße' },
  { feld: 'hausnummer', label: 'Hausnummer' },
  { feld: 'plz', label: 'PLZ', gueltig: (v) => /^\d{5}$/.test(v) },
  { feld: 'ort', label: 'Ort' },
  { feld: 'berufsstatus', label: 'Berufsstatus' },
  { feld: 'familienstand', label: 'Familienstand' },
  {
    feld: 'steuer_id',
    label: 'Steuer-ID / Steuernummer',
    gueltig: (v) =>
      /^\d{11}$/.test(v.replace(/\s/g, '')) || /^\d{2,3}\/\d{3,4}\/\d{4,5}$/.test(v.trim())
  },
  {
    feld: 'iban',
    label: 'IBAN',
    gueltig: (v) => /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v.replace(/\s/g, '').toUpperCase()),
  },
];

/** Liste der fehlenden oder ungültigen Stammdaten, z. B. ["Steuer-ID", "IBAN (ungültig)"] */
export function fehlendeStammdaten(user: User): string[] {
  return PFLICHTFELDER.flatMap(({ feld, label, gueltig }) => {
    const roh = user[feld];
    const wert = roh === null || roh === undefined ? '' : String(roh).trim();
    if (!wert) return [label];
    if (gueltig && !gueltig(wert)) return [`${label} (ungültig)`];
    return [];
  });
}

export const stammdatenVollstaendig = (user: User) => fehlendeStammdaten(user).length === 0;
