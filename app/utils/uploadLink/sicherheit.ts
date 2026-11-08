// Kryptografische Helfer für Upload-Links. Nur serverseitig verwenden.
import 'server-only';
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';

export const LINK_GUELTIG_TAGE = 14;
export const CODE_GUELTIG_MIN = 10;
export const MAX_CODE_VERSUCHE = 5;
export const SITZUNG_STUNDEN = 2;
export const MAX_UPLOADS_PRO_LINK = 50;
export const MAX_DATEIGROESSE = 20 * 1024 * 1024;
export const ERLAUBTE_TYPEN = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const sha256 = (wert: string) => createHash('sha256').update(wert).digest('hex');

/** Zufälliger, URL-tauglicher Token (256 Bit) */
export const neuerToken = () => randomBytes(32).toString('base64url');

/** 6-stelliger Bestätigungscode */
export const neuerCode = () => String(randomInt(0, 1_000_000)).padStart(6, '0');

export function gleich(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function geheimnis() {
  const s = process.env.UPLOAD_LINK_SECRET;
  if (!s || s.length < 32)
    throw new Error('UPLOAD_LINK_SECRET fehlt oder ist zu kurz (mind. 32 Zeichen).');
  return s;
}

export const sitzungsCookieName = (linkId: number) => `ul_${linkId}`;

/** Signierter Sitzungswert: "<linkId>.<ablauf>.<signatur>" */
export function sitzungErstellen(linkId: number) {
  const ablauf = Date.now() + SITZUNG_STUNDEN * 3600_000;
  const daten = `${linkId}.${ablauf}`;
  const sig = createHmac('sha256', geheimnis()).update(daten).digest('base64url');
  return { wert: `${daten}.${sig}`, ablauf: new Date(ablauf) };
}

export function sitzungPruefen(wert: string | undefined, linkId: number) {
  if (!wert) return false;
  const [id, ablauf, sig] = wert.split('.');
  if (Number(id) !== linkId || !ablauf || !sig || Number(ablauf) < Date.now()) return false;
  const erwartet = createHmac('sha256', geheimnis()).update(`${id}.${ablauf}`).digest('base64url');
  return gleich(sig, erwartet);
}

/** "lukas@gmail.com" → "l***s@gmail.com" */
export function emailMaskieren(email: string) {
  const [name, domain] = email.split('@');
  if (!domain) return '***';
  const sichtbar = name.length <= 2 ? name[0] : `${name[0]}***${name[name.length - 1]}`;
  return `${sichtbar}@${domain}`;
}

export const dateinameBereinigen = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(-120);
