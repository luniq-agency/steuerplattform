'use server';

import { createClient } from '@/app/utils/supabase/server';
import { supabaseAdmin } from '@/app/utils/supabase/admin';

const GUELTIGKEIT = 60 * 10; // 10 Minuten

// Aus gespeicherter URL oder Pfad Bucket und Dateipfad ermitteln
function speicherort(file: string, standardBucket: string) {
  const m = file.match(
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?|$)/
  );
  if (m) return { bucket: m[1], pfad: decodeURIComponent(m[2]) };
  return { bucket: standardBucket, pfad: file }; // bereits ein reiner Pfad
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
