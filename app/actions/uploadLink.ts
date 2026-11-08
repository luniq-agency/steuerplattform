'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/app/utils/supabase/server';
import { supabaseAdmin } from '@/app/utils/supabase/admin';
import { sendHtmlEmail, templateUploadCode, templateUploadLink } from '@/app/utils/mail';
import {
  CODE_GUELTIG_MIN,
  ERLAUBTE_TYPEN,
  LINK_GUELTIG_TAGE,
  MAX_CODE_VERSUCHE,
  MAX_DATEIGROESSE,
  MAX_UPLOADS_PRO_LINK,
  dateinameBereinigen,
  gleich,
  neuerCode,
  neuerToken,
  sha256,
  sitzungErstellen,
  sitzungPruefen,
  sitzungsCookieName,
} from '@/app/utils/uploadLink/sicherheit';

const BUCKET = 'dokumente'; // ← Name deines (privaten) Dokumenten-Buckets

type Ergebnis<T = object> = ({ error?: undefined } & T) | ({ error: string } & Partial<T>);

// ---------- Hilfen ----------

/** Gültigen Link zum Token laden (nicht abgelaufen, nicht widerrufen) */
async function linkLaden(token: string) {
  if (!/^[A-Za-z0-9_-]{30,64}$/.test(token)) return null;
  const { data } = await supabaseAdmin
    .from('upload_link')
    .select('*')
    .eq('token_hash', sha256(token))
    .maybeSingle();
  if (!data || data.revoked_at || new Date(data.expires_at) < new Date()) return null;
  return data;
}

async function sitzungGueltig(linkId: number) {
  const jar = await cookies();
  return sitzungPruefen(jar.get(sitzungsCookieName(linkId))?.value, linkId);
}

// ---------- 1. Agenturist verschickt den Link ----------

export async function uploadLinkSenden(
  mandantId: number,
  vorgangId?: number,
  nachricht?: string
): Promise<Ergebnis<{ gesendetAn: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet.' };
  const text = nachricht?.trim().slice(0, 2000) || null;
  const { data: ich } = await supabaseAdmin
    .from('user')
    .select('id, rolle, vorname, nachname')
    .eq('user_id', user.id)
    .single();
  const { data: mandant } = await supabaseAdmin
    .from('user')
    .select('id, vorname, email, bearbeiter')
    .eq('id', mandantId)
    .single();

  if (!ich || !mandant) return { error: 'Mandant nicht gefunden.' };
  if (ich.rolle !== 'admin' && mandant.bearbeiter !== ich.id)
    return { error: 'Keine Berechtigung.' };
  if (!mandant.email) return { error: 'Für diesen Mandanten ist keine E-Mail-Adresse hinterlegt.' };

  // Optional: Vorgang prüfen – er muss zu diesem Mandanten gehören
  let vorgangTitel: string | null = null;
  if (vorgangId) {
    const { data: vorgang } = await supabaseAdmin
      .from('vorgang')
      .select('id, titel, user, created_by')
      .eq('id', vorgangId)
      .single();
    if (!vorgang || (vorgang.user !== mandant.id && vorgang.created_by !== mandant.id)) {
      return { error: 'Der Vorgang gehört nicht zu diesem Mandanten.' };
    }
    vorgangTitel = vorgang.titel;
  }

  const token = neuerToken();
  const { error } = await supabaseAdmin.from('upload_link').insert({
    created_by: ich.id,
    mandant: mandant.id,
    vorgang: vorgangId ?? null,
    nachricht: text,
    token_hash: sha256(token),
    expires_at: new Date(Date.now() + LINK_GUELTIG_TAGE * 86_400_000).toISOString(),
  });
  if (error) {
    console.error('Upload-Link konnte nicht angelegt werden:', error);
    return { error: 'Der Link konnte nicht erstellt werden.' };
  }

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/hochladen/${token}`;
  try {
    await sendHtmlEmail(
      mandant.email,
      vorgangTitel
        ? `Bitte lade Unterlagen hoch: ${vorgangTitel}`
        : 'Bitte lade deine Unterlagen hoch',
      templateUploadLink(
        mandant.vorname ?? '',
        `${ich.vorname ?? ''} ${ich.nachname ?? ''}`.trim(),
        url,
        LINK_GUELTIG_TAGE,
        vorgangTitel,
        text
      )
    );
  } catch (err) {
    console.error('Upload-Link-Mail fehlgeschlagen:', err);
    return { error: 'Die E-Mail konnte nicht gesendet werden.' };
  }

  return { gesendetAn: mandant.email };
}

/** Alle offenen Links eines Mandanten widerrufen */
export async function uploadLinksWiderrufen(mandantId: number): Promise<Ergebnis> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet.' };

  const { data: ich } = await supabaseAdmin
    .from('user')
    .select('id, rolle')
    .eq('user_id', user.id)
    .single();
  const { data: mandant } = await supabaseAdmin
    .from('user')
    .select('bearbeiter')
    .eq('id', mandantId)
    .single();
  if (!ich || !mandant || (ich.rolle !== 'admin' && mandant.bearbeiter !== ich.id))
    return { error: 'Keine Berechtigung.' };

  await supabaseAdmin
    .from('upload_link')
    .update({ revoked_at: new Date().toISOString() })
    .eq('mandant', mandantId)
    .is('revoked_at', null);
  return {};
}

// ---------- 2. Mandant bestätigt seine E-Mail ----------

const NEUTRAL =
  'Falls die E-Mail-Adresse zu dieser Einladung passt, haben wir dir einen Code geschickt.';

export async function uploadCodeAnfordern(
  token: string,
  email: string
): Promise<Ergebnis<{ hinweis: string }>> {
  const link = await linkLaden(token);
  if (!link) return { error: 'Dieser Link ist ungültig oder abgelaufen.' };
  if (link.code_versuche >= MAX_CODE_VERSUCHE)
    return { error: 'Zu viele Versuche. Bitte fordere einen neuen Link an.' };

  const { data: mandant } = await supabaseAdmin
    .from('user')
    .select('email')
    .eq('id', link.mandant)
    .single();
  const passt =
    !!mandant?.email && gleich(mandant.email.trim().toLowerCase(), email.trim().toLowerCase());

  // Falsche Adresse zählt als Fehlversuch, Antwort bleibt neutral
  if (!passt) {
    await supabaseAdmin
      .from('upload_link')
      .update({ code_versuche: link.code_versuche + 1 })
      .eq('id', link.id);
    return { hinweis: NEUTRAL };
  }

  const code = neuerCode();
  await supabaseAdmin
    .from('upload_link')
    .update({
      code_hash: sha256(`${link.id}:${code}`),
      code_expires_at: new Date(Date.now() + CODE_GUELTIG_MIN * 60_000).toISOString(),
    })
    .eq('id', link.id);

  try {
    await sendHtmlEmail(
      mandant!.email!,
      `Dein Code: ${code}`,
      templateUploadCode(code, CODE_GUELTIG_MIN)
    );
  } catch (err) {
    console.error('Code-Mail fehlgeschlagen:', err);
    return { error: 'Der Code konnte nicht gesendet werden. Bitte versuche es erneut.' };
  }
  return { hinweis: NEUTRAL };
}

export async function uploadCodeBestaetigen(token: string, code: string): Promise<Ergebnis> {
  const link = await linkLaden(token);
  if (!link) return { error: 'Dieser Link ist ungültig oder abgelaufen.' };
  if (link.code_versuche >= MAX_CODE_VERSUCHE)
    return { error: 'Zu viele Versuche. Bitte fordere einen neuen Link an.' };

  const gueltig =
    !!link.code_hash &&
    !!link.code_expires_at &&
    new Date(link.code_expires_at) > new Date() &&
    gleich(link.code_hash, sha256(`${link.id}:${code.trim()}`));

  if (!gueltig) {
    await supabaseAdmin
      .from('upload_link')
      .update({ code_versuche: link.code_versuche + 1 })
      .eq('id', link.id);
    return { error: 'Der Code ist falsch oder abgelaufen.' };
  }

  // Code verbrauchen, Sitzung setzen
  await supabaseAdmin
    .from('upload_link')
    .update({
      code_hash: null,
      code_expires_at: null,
      code_versuche: 0,
      verifiziert_at: new Date().toISOString(),
    })
    .eq('id', link.id);

  const { wert, ablauf } = sitzungErstellen(link.id);
  const jar = await cookies();
  jar.set(sitzungsCookieName(link.id), wert, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/hochladen',
    expires: ablauf,
  });
  return {};
}

// ---------- 3. Hochladen ----------

export type UploadAnfrage = { name: string; typ: string; groesse: number };
export type UploadZiel = { pfad: string; token: string };

/** Signierte Upload-URLs erzeugen; der Browser lädt damit direkt in den privaten Bucket. */
export async function uploadVorbereiten(
  token: string,
  dateien: UploadAnfrage[]
): Promise<Ergebnis<{ ziele: UploadZiel[] }>> {
  const link = await linkLaden(token);
  if (!link) return { error: 'Dieser Link ist ungültig oder abgelaufen.' };
  if (!(await sitzungGueltig(link.id)))
    return { error: 'Bitte bestätige zuerst deine E-Mail-Adresse.' };

  if (!dateien.length) return { error: 'Keine Dateien ausgewählt.' };
  if (link.uploads + dateien.length > MAX_UPLOADS_PRO_LINK)
    return { error: 'Über diesen Link können keine weiteren Dateien hochgeladen werden.' };

  for (const d of dateien) {
    if (d.groesse > MAX_DATEIGROESSE) return { error: `„${d.name}“ ist größer als 20 MB.` };
    if (!ERLAUBTE_TYPEN.includes(d.typ))
      return { error: `„${d.name}“ hat ein nicht erlaubtes Dateiformat.` };
  }

  const ziele: UploadZiel[] = [];
  for (const d of dateien) {
    const pfad = `${link.mandant}/upload-link/${Date.now()}-${neuerToken().slice(0, 8)}-${dateinameBereinigen(d.name)}`;
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(pfad);
    if (error || !data) {
      console.error('Signierte Upload-URL fehlgeschlagen:', error);
      return { error: 'Der Upload konnte nicht vorbereitet werden.' };
    }
    ziele.push({ pfad: data.path, token: data.token });
  }
  return { ziele };
}

export type UploadFertig = { pfad: string; name: string; typ: string };

/** Nach dem Upload: Dokumente dem Mandanten zuordnen und Bearbeiter benachrichtigen. */
export async function uploadAbschliessen(
  token: string,
  dateien: UploadFertig[]
): Promise<Ergebnis<{ anzahl: number }>> {
  const link = await linkLaden(token);
  if (!link) return { error: 'Dieser Link ist ungültig oder abgelaufen.' };
  if (!(await sitzungGueltig(link.id)))
    return { error: 'Bitte bestätige zuerst deine E-Mail-Adresse.' };

  const praefix = `${link.mandant}/upload-link/`;
  const gueltig: UploadFertig[] = [];

  for (const d of dateien) {
    // Nur Pfade akzeptieren, die wir selbst für diesen Mandanten vergeben haben
    if (!d.pfad.startsWith(praefix) || d.pfad.includes('..')) continue;
    const dateiname = d.pfad.slice(praefix.length);
    const { data } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(praefix.slice(0, -1), { search: dateiname, limit: 1 });
    if (data?.some((o) => o.name === dateiname)) gueltig.push(d);
  }
  if (!gueltig.length) return { error: 'Es wurden keine Dateien empfangen.' };

  const { data: neueDokumente, error } = await supabaseAdmin
    .from('dokument')
    .insert(
      gueltig.map((d) => ({
        file: d.pfad,
        name: d.name.trim().slice(0, 200) || 'Dokument',
        type: d.typ,
        user: link.mandant,
        ordner: null,
      }))
    )
    .select('id');

  if (error || !neueDokumente) {
    console.error('Dokumente konnten nicht angelegt werden:', error);
    return { error: 'Die Dokumente konnten nicht gespeichert werden.' };
  }

  const neueIds = neueDokumente.map((d) => d.id as number);
  await supabaseAdmin
    .from('upload_link')
    .update({ uploads: link.uploads + neueIds.length })
    .eq('id', link.id);

  const { data: mandant } = await supabaseAdmin
    .from('user')
    .select('vorname, nachname, bearbeiter')
    .eq('id', link.mandant)
    .single();
  const mandantName =
    `${mandant?.vorname ?? ''} ${mandant?.nachname ?? ''}`.trim() || 'Der Mandant';
  const anzahlText = `${neueIds.length} ${neueIds.length === 1 ? 'Dokument' : 'Dokumente'}`;

  // An den Vorgang hängen, falls der Link aus einem Vorgang kam
  let vorgangTitel: string | null = null;
  if (link.vorgang) {
    const { data: vorgang } = await supabaseAdmin
      .from('vorgang')
      .select('id, titel, dokumente')
      .eq('id', link.vorgang)
      .single();

    if (vorgang) {
      vorgangTitel = vorgang.titel;
      const bisher: number[] = Array.isArray(vorgang.dokumente) ? vorgang.dokumente : [];

      await supabaseAdmin
        .from('vorgang')
        .update({ dokumente: [...bisher, ...neueIds], last_updated: new Date().toISOString() })
        .eq('id', vorgang.id);

      await supabaseAdmin.from('vorgang_update').insert({
        body: `${mandantName} hat ${anzahlText} über den Upload-Link hochgeladen.`,
        created_by: link.mandant,
        dokumente: neueIds,
        vorgang: vorgang.id,
      });
    }
  }

  // Bearbeiter informieren
  if (mandant?.bearbeiter) {
    await supabaseAdmin.from('benachrichtigung').insert({
      user: mandant.bearbeiter,
      gelesen: false,
      title: vorgangTitel ? `Neue Dokumente: ${vorgangTitel}` : 'Neue Dokumente über Upload-Link',
      message: `${mandantName} hat ${anzahlText} hochgeladen${vorgangTitel ? ` (Vorgang „${vorgangTitel}“)` : ''}.`,
      ref: String(link.vorgang ?? link.mandant),
      type: link.vorgang ? 'vorgang' : 'dokument',
    });
  }

  return { anzahl: neueIds.length };
}
