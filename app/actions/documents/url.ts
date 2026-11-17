'use server';

import { createClient } from '@/app/utils/supabase/server';
import { supabaseAdmin } from '@/app/utils/supabase/admin';

const GUELTIGKEIT = 60 * 10; // 10 Minuten

function bucketUndPfad(url: string): { bucket: string; pfad: string } | null {
  const m = url.match(
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?|$)/
  );
  return m ? { bucket: m[1], pfad: decodeURIComponent(m[2]) } : null;
}

// Aus gespeicherter URL oder Pfad Bucket und Dateipfad ermitteln
function speicherort(file: string, standardBucket: string) {
  const m = file.match(
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?|$)/
  );
  if (m) return { bucket: m[1], pfad: decodeURIComponent(m[2]) };
  return { bucket: standardBucket, pfad: file }; // bereits ein reiner Pfad
}

export async function dokumenteDownload(
  ids: number[]
): Promise<{ dateien?: { name: string; url: string }[]; error?: string }> {
  if (!ids.length) return { dateien: [] };
  if (ids.length > 100) return { error: 'Bitte höchstens 100 Dokumente auf einmal herunterladen.' };

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Nicht angemeldet.' };

  const { data: ich } = await supabase
    .from('user')
    .select('id, rolle')
    .eq('user_id', authUser.id)
    .maybeSingle();
  if (!ich) return { error: 'Profil nicht gefunden.' };

  const { data: docs } = await supabaseAdmin
    .from('dokument')
    .select('id, file, name, user')
    .in('id', ids);
  if (!docs?.length) return { error: 'Dokumente nicht gefunden.' };

  // Berechtigung: eigene, die der eigenen Mandanten, oder Admin
  let erlaubteBesitzer = new Set<number>([ich.id]);
  if (ich.rolle !== 'admin') {
    const { data: mandanten } = await supabaseAdmin
      .from('user')
      .select('id')
      .eq('bearbeiter', ich.id)
      .in('id', [...new Set(docs.map((d) => d.user))]);
    mandanten?.forEach((m) => erlaubteBesitzer.add(m.id));
  }

  const dateien: { name: string; url: string }[] = [];
  for (const d of docs) {
    if (ich.rolle !== 'admin' && !erlaubteBesitzer.has(d.user)) continue;
    const ziel = d.file ? bucketUndPfad(d.file) : null;
    if (!ziel) continue;

    const endung = ziel.pfad.includes('.') ? ziel.pfad.split('.').pop()! : '';
    let name =
      (d.name ?? '').trim() ||
      ziel.pfad
        .split('/')
        .pop()!
        .replace(/^\d{10,}-/, '');
    if (endung && !name.toLowerCase().endsWith(`.${endung.toLowerCase()}`))
      name = `${name}.${endung}`;

    const { data } = await supabaseAdmin.storage
      .from(ziel.bucket)
      .createSignedUrl(ziel.pfad, 300, { download: name });
    if (data) dateien.push({ name, url: data.signedUrl });
  }

  if (!dateien.length) return { error: 'Keine Berechtigung für die ausgewählten Dokumente.' };
  return { dateien };
}

export async function dokumentUrl(dokumentId: number): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet.' };

  const { data: ich, error: ichError } = await supabase
    .from('user')
    .select('id, rolle')
    .eq('user_id', user.id)
    .single();

  const { data: dok, error: dokError } = await supabaseAdmin
    .from('dokument')
    .select('id, file, user')
    .eq('id', dokumentId)
    .single();

  if (!ich || !dok?.file) {
    console.error('dokumentUrl:', { dokumentId, ich, ichError, dok, dokError });
    return { error: 'Dokument nicht gefunden.' };
  }

  /*
  const { data: ich } = await supabase.from('user').select('id, rolle').eq('user_id', user.id).single();
  const { data: dok } = await supabaseAdmin.from('dokument').select('id, file, user').eq('id', dokumentId).single();
  if (!ich || !dok?.file) return { error: 'Dokument nicht gefunden.' };
  */

  // Zugriff: Besitzer, dessen Bearbeiter oder Admin
  if (ich.rolle !== 'admin' && dok.user !== ich.id) {
    const { data: besitzer } = await supabaseAdmin
      .from('user')
      .select('bearbeiter')
      .eq('id', dok.user)
      .single();
    if (besitzer?.bearbeiter !== ich.id) return { error: 'Keine Berechtigung.' };
  }

  const { bucket, pfad } = speicherort(dok.file, 'dokumente');
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(pfad, GUELTIGKEIT);

  if (error || !data) {
    console.error('Signierte URL fehlgeschlagen:', error);
    return { error: 'Die Datei konnte nicht geladen werden.' };
  }
  return { url: data.signedUrl };
}
