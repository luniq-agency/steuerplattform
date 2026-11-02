// Regelbasierte Feldextraktion aus Text (digitale PDFs) und Validierung
import { BelegFelder, LEERE_FELDER } from './types';

const BETRAG = /-?\d{1,3}(?:\.\d{3})*,\d{2}(?!\d)|-?\d+,\d{2}(?!\d)/g;
const DATUM = /\b(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4}|\d{2})\b/g;

const KW_BRUTTO = /(gesamtbetrag|rechnungsbetrag|endbetrag|zu zahlen|zahlbetrag|brutto|summe|gesamt|total)/i;
const KW_NETTO = /(netto|zwischensumme|nettobetrag)/i;
const KW_STEUER = /(mwst|mw\.?\s?st|ust\.?|umsatzsteuer|mehrwertsteuer)/i;
const KW_DATUM = /(rechnungsdatum|belegdatum|datum)/i;

export const toNumber = (s: string) => Number(s.replace(/\./g, '').replace(',', '.'));
const round2 = (n: number) => Math.round(n * 100) / 100;

const betraegeIn = (zeile: string) => (zeile.match(BETRAG) ?? []).map(toNumber);

// Erster Betrag NACH dem Schlüsselwort in der Zeile; steht er in der Folgezeile (Tabellenlayout), diese nehmen
function betragNachKeyword(zeilen: string[], kw: RegExp, ausschluss?: RegExp): number | null {
  const treffer: number[] = [];
  zeilen.forEach((z, i) => {
    const m = z.match(kw);
    if (!m || m.index == null || (ausschluss && ausschluss.test(z))) return;
    const danach = betraegeIn(z.slice(m.index + m[0].length));
    if (danach.length) treffer.push(danach[0]);
    else {
      const folge = betraegeIn(zeilen[i + 1] ?? '');
      if (folge.length) treffer.push(folge[0]);
    }
  });
  return treffer.length ? Math.max(...treffer) : null;
}

// Steuerzeilen wie auf Kassenbons: "A 19% Netto 5,45 MwSt 1,04" – je Satz eine Zeile, Summen bilden
function steuerTabelle(zeilen: string[]) {
  const zeilenMitBeidem = zeilen.filter((z) => KW_NETTO.test(z) && KW_STEUER.test(z));
  if (!zeilenMitBeidem.length) return null;
  let netto = 0;
  let steuern = 0;
  for (const z of zeilenMitBeidem) {
    const n = z.match(KW_NETTO)!;
    const st = z.match(KW_STEUER)!;
    const nettoWert = betraegeIn(z.slice(n.index! + n[0].length))[0];
    const steuerWert = betraegeIn(z.slice(st.index! + st[0].length))[0];
    if (nettoWert == null || steuerWert == null) return null;
    netto += nettoWert;
    steuern += steuerWert;
  }
  return { netto: round2(netto), steuern: round2(steuern) };
}

function datumFinden(text: string, zeilen: string[]): string | null {
  const parse = (m: RegExpMatchArray) => {
    const jahr = m[3].length === 2 ? `20${m[3]}` : m[3];
    const tag = Number(m[1]);
    const monat = Number(m[2]);
    if (monat < 1 || monat > 12 || tag < 1 || tag > 31) return null;
    return `${jahr}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`;
  };
  // Bevorzugt: Datum in einer Zeile mit "Rechnungsdatum" o. Ä. (nicht "Lieferdatum"/"fällig")
  for (const z of zeilen) {
    if (KW_DATUM.test(z) && !/(liefer|leistung|fällig|zahlbar)/i.test(z)) {
      const m = [...z.matchAll(DATUM)][0];
      const d = m && parse(m);
      if (d) return d;
    }
  }
  for (const m of text.matchAll(DATUM)) {
    const d = parse(m);
    if (d) return d;
  }
  return null;
}

function steuersatzFinden(text: string): number | null {
  const saetze = new Set<number>();
  for (const m of text.matchAll(/\b(19|7|0)(?:[,.]0{1,2})?\s?%/g)) saetze.add(Number(m[1]) / 100);
  if (saetze.size === 1) return [...saetze][0];
  if (saetze.has(0.19) && !saetze.has(0.07)) return 0.19;
  return null; // gemischt oder nicht gefunden
}

export const lieferantKey = (name: string) =>
  name
    .toLowerCase()
    .replace(/\b(gmbh|ag|kg|ug|ohg|gbr|e\.?\s?k\.?|mbh|co\.?|&|haftungsbeschränkt)\b/g, '')
    .replace(/[^a-z0-9äöüß]/g, '');

/**
 * @param bekannteLieferanten Lieferanten, die das Team schon gebucht hat. Wird einer davon im
 *   Text gefunden, ist das deutlich zuverlässiger als "erste Zeile".
 */
export function extrahiereAusText(text: string, bekannteLieferanten: string[] = []): BelegFelder {
  const zeilen = text.split('\n').map((z) => z.replace(/\s+/g, ' ').trim()).filter(Boolean);
  const textKey = lieferantKey(text);

  const bekannt = bekannteLieferanten
    .filter((l) => lieferantKey(l).length >= 3 && textKey.includes(lieferantKey(l)))
    .sort((a, b) => b.length - a.length)[0];

  const ersteZeile = zeilen.find((z) => /[a-zäöü]{3,}/i.test(z) && !/(rechnung|seite|page)/i.test(z));

  const tabelle = steuerTabelle(zeilen);
  const netto = tabelle?.netto ?? betragNachKeyword(zeilen, KW_NETTO, KW_STEUER);
  const steuern = tabelle?.steuern ?? betragNachKeyword(zeilen, KW_STEUER, /(nr\b|id\b|ust-?id|steuernummer|netto)/i);
  let brutto = betragNachKeyword(zeilen, KW_BRUTTO, KW_NETTO);
  if (brutto == null) {
    const alle = (text.match(BETRAG) ?? []).map(toNumber);
    brutto = alle.length ? Math.max(...alle) : null;
  }

  const rechnungsnummer =
    text.match(/(?:rechnungs?-?\s?(?:nr|nummer)|beleg-?\s?(?:nr|nummer)|invoice\s?(?:no|number))\.?\s*:?\s*([A-Z0-9][A-Z0-9\-\/_.]{2,})/i)?.[1] ??
    null;

  return {
    ...LEERE_FELDER,
    lieferant: bekannt ?? ersteZeile ?? null,
    rechnungsnummer,
    datum: datumFinden(text, zeilen),
    betrag_netto: netto,
    betrag_steuern: steuern,
    betrag_brutto: brutto,
    steuersatz: steuersatzFinden(text),
    waehrung: /\b(USD|\$)\b/.test(text) ? 'USD' : 'EUR',
    ust_id: text.match(/\bDE\s?\d{9}\b/)?.[0].replace(/\s/g, '') ?? null,
    iban: text.match(/\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}(?:\s?[A-Z0-9]{1,4})?\b/)?.[0].replace(/\s/g, '') ?? null,
  };
}

// IBAN-Prüfziffer (Mod 97)
export function ibanGueltig(iban: string) {
  const s = iban.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const umgestellt = (s.slice(4) + s.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const ziffer of umgestellt) rest = (rest * 10 + Number(ziffer)) % 97;
  return rest === 1;
}

export function validiere(f: BelegFelder) {
  const pruefen = new Set<keyof BelegFelder>();
  const hinweise: string[] = [];
  const heute = new Date().toISOString().slice(0, 10);

  if (!f.lieferant) pruefen.add('lieferant');
  if (f.betrag_brutto == null || f.betrag_brutto === 0) pruefen.add('betrag_brutto');

  if (!f.datum) pruefen.add('datum');
  else if (f.datum > heute) {
    pruefen.add('datum');
    hinweise.push('Das Belegdatum liegt in der Zukunft.');
  } else if (Number(f.datum.slice(0, 4)) < new Date().getFullYear() - 3) {
    pruefen.add('datum');
    hinweise.push('Das Belegdatum ist älter als drei Jahre.');
  }

  if (f.steuersatz == null) {
    pruefen.add('steuersatz');
    if (f.betrag_netto != null && f.betrag_steuern != null) hinweise.push('Mehrere oder keine Steuersätze erkannt.');
  }
  else if (![0, 0.07, 0.19].includes(f.steuersatz)) {
    pruefen.add('steuersatz');
    hinweise.push('Ungewöhnlicher Steuersatz.');
  }

  // Rechenprüfung Netto + MwSt. = Brutto (Toleranz 2 Cent)
  if (f.betrag_netto != null && f.betrag_steuern != null && f.betrag_brutto != null) {
    if (Math.abs(f.betrag_netto + f.betrag_steuern - f.betrag_brutto) > 0.02) {
      pruefen.add('betrag_brutto');
      hinweise.push('Netto + MwSt. ergibt nicht den Bruttobetrag.');
    }
  }
  // Steuerbetrag passt zum Satz?
  if (f.betrag_netto != null && f.betrag_steuern != null && f.steuersatz != null) {
    if (Math.abs(f.betrag_netto * f.steuersatz - f.betrag_steuern) > 0.05) {
      pruefen.add('steuersatz');
      hinweise.push('MwSt.-Betrag passt nicht zum Steuersatz (evtl. mehrere Sätze).');
    }
  }

  if (f.iban && !ibanGueltig(f.iban)) hinweise.push('Die IBAN auf dem Beleg ist ungültig.');

  const geprueft = ['lieferant', 'betrag_brutto', 'datum', 'steuersatz'] as const;
  const konfidenz = round2(geprueft.filter((k) => !pruefen.has(k)).length / geprueft.length - hinweise.length * 0.1);

  return { pruefen: [...pruefen], hinweise, konfidenz: Math.max(0, konfidenz) };
}

/** Fehlende Beträge aus den vorhandenen ableiten (z. B. Netto aus Brutto und Satz). */
export function ergaenze(f: BelegFelder): BelegFelder {
  const r = { ...f };
  if (r.betrag_brutto != null && r.steuersatz != null) {
    if (r.betrag_netto == null && r.betrag_steuern == null) {
      r.betrag_netto = round2(r.betrag_brutto / (1 + r.steuersatz));
      r.betrag_steuern = round2(r.betrag_brutto - r.betrag_netto);
    } else if (r.betrag_netto == null && r.betrag_steuern != null) {
      r.betrag_netto = round2(r.betrag_brutto - r.betrag_steuern);
    } else if (r.betrag_steuern == null && r.betrag_netto != null) {
      r.betrag_steuern = round2(r.betrag_brutto - r.betrag_netto);
    }
  }
  return r;
}