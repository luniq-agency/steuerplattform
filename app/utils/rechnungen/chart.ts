import { Rechnung } from '@/app/types/rechnung/Rechnungen';

export type RechnungsKennzahlen = {
  jahr: number;
  anzahlJahr: number; // Rechnungen im Jahr (ohne Entwürfe/storniert)
  anzahlMonat: number; // Rechnungen im laufenden Monat
  umsatzJahr: number; // Brutto, Gutschriften abgezogen
  umsatzVorjahr: number; // gleicher Zeitraum im Vorjahr (bis heute)
  veraenderungProzent: number | null; // ggü. Vorjahr, null wenn Vorjahr 0
  umsatzMonat: number;
  bezahltJahr: number;
  offenAnzahl: number; // alle offenen, unabhängig vom Jahr
  offenSumme: number;
  ueberfaelligAnzahl: number; // offen und Zahlungsziel überschritten
  ueberfaelligSumme: number;
  durchschnitt: number; // Ø Rechnungsbetrag im Jahr
  besterMonat: { label: string; umsatz: number } | null;
};

const datumAls = (v: unknown): Date | null => {
  if (!v) return null;
  if (v instanceof Date) return v;
  const [j, m, t] = String(v).slice(0, 10).split('-').map(Number);
  return j ? new Date(j, (m || 1) - 1, t || 1) : null;
};

export function rechnungsKennzahlen(
  rechnungen: Rechnung[],
  jahr = new Date().getFullYear()
): RechnungsKennzahlen {
  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  // Vorjahresvergleich nur bis zum gleichen Tag, sonst hinkt das laufende Jahr immer hinterher
  const stichtagVorjahr = new Date(jahr - 1, heute.getMonth(), heute.getDate());

  const k: RechnungsKennzahlen = {
    jahr,
    anzahlJahr: 0,
    anzahlMonat: 0,
    umsatzJahr: 0,
    umsatzVorjahr: 0,
    veraenderungProzent: null,
    umsatzMonat: 0,
    bezahltJahr: 0,
    offenAnzahl: 0,
    offenSumme: 0,
    ueberfaelligAnzahl: 0,
    ueberfaelligSumme: 0,
    durchschnitt: 0,
    besterMonat: null,
  };
  const proMonat = new Array(12).fill(0);

  for (const r of rechnungen) {
    const status = String(r.status ?? '').toLowerCase();
    if (IGNORIEREN.includes(status)) continue;

    const datum = datumAls(r.rechnungsdatum);
    const betrag = (Number(r.betrag_gesamt) || 0) * (r.kategorie === 'gutschrift' ? -1 : 1);
    const bezahlt = BEZAHLT.includes(status);

    // Offen / überfällig – unabhängig vom Jahr
    if (!bezahlt) {
      k.offenAnzahl++;
      k.offenSumme += betrag;
      const ziel = datumAls(r.bezahlziel);
      if (ziel && ziel < heute) {
        k.ueberfaelligAnzahl++;
        k.ueberfaelligSumme += betrag;
      }
    }

    if (!datum) continue;

    if (datum.getFullYear() === jahr) {
      k.anzahlJahr++;
      k.umsatzJahr += betrag;
      if (bezahlt) k.bezahltJahr += betrag;
      proMonat[datum.getMonth()] += betrag;
      if (jahr === heute.getFullYear() && datum.getMonth() === heute.getMonth()) {
        k.anzahlMonat++;
        k.umsatzMonat += betrag;
      }
    } else if (datum.getFullYear() === jahr - 1 && datum <= stichtagVorjahr) {
      k.umsatzVorjahr += betrag;
    }
  }

  k.durchschnitt = k.anzahlJahr ? k.umsatzJahr / k.anzahlJahr : 0;
  k.veraenderungProzent = k.umsatzVorjahr
    ? Math.round(((k.umsatzJahr - k.umsatzVorjahr) / Math.abs(k.umsatzVorjahr)) * 1000) / 10
    : null;

  const max = Math.max(...proMonat);
  if (max > 0) {
    const m = proMonat.indexOf(max);
    k.besterMonat = {
      label: new Date(jahr, m, 1).toLocaleDateString('de-DE', { month: 'long' }),
      umsatz: runden(max),
    };
  }

  // Beträge runden
  for (const f of [
    'umsatzJahr',
    'umsatzVorjahr',
    'umsatzMonat',
    'bezahltJahr',
    'offenSumme',
    'ueberfaelligSumme',
    'durchschnitt',
  ] as const) {
    k[f] = runden(k[f]);
  }
  return k;
}

type DataPoint = { x: string; y: number };
type Series = { name: string; data: DataPoint[] };

const BEZAHLT = ['bezahlt', 'paid'];
const IGNORIEREN = ['draft', 'entwurf', 'storniert', 'void'];

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const runden = (n: number) => Math.round(n * 100) / 100;

/** Summen pro Monat (Rechnungsdatum), lückenlos für die letzten `anzahl` Monate */
export function rechnungenProMonat(
  rechnungen: Rechnung[],
  anzahl = 12,
  bis = new Date()
): Series[] {
  // Monate vorbereiten: ältester zuerst
  const monate = Array.from({ length: anzahl }, (_, i) => {
    const d = new Date(bis.getFullYear(), bis.getMonth() - (anzahl - 1 - i), 1);
    return {
      key: key(d),
      label: d.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }), // "Nov. 26"
      gesamt: 0,
      bezahlt: 0,
      offen: 0,
    };
  });
  const index = new Map(monate.map((m, i) => [m.key, i]));

  for (const r of rechnungen) {
    if (!r.rechnungsdatum) continue;
    const status = String(r.status ?? '').toLowerCase();
    if (IGNORIEREN.includes(status)) continue;

    const datum = r.rechnungsdatum as unknown as string | Date;
    const k = typeof datum === 'string' ? datum.slice(0, 7) : key(datum);
    const i = index.get(k);
    if (i === undefined) continue;

    // Gutschriften mindern den Umsatz
    const betrag = (Number(r.betrag_gesamt) || 0) * (r.kategorie === 'gutschrift' ? -1 : 1);

    monate[i].gesamt += betrag;
    if (BEZAHLT.includes(status)) monate[i].bezahlt += betrag;
    else monate[i].offen += betrag;
  }

  const reihe = (name: string, feld: 'gesamt' | 'bezahlt' | 'offen'): Series => ({
    name,
    data: monate.map((m) => ({ x: m.label, y: runden(m[feld]) })),
  });

  return [reihe('Umsatz', 'gesamt'), reihe('Bezahlt', 'bezahlt'), reihe('Offen', 'offen')];
}
