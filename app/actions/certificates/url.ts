'use server';

import { createClient } from '@/app/utils/supabase/server';
import { supabaseAdmin } from '@/app/utils/supabase/admin';

// Zerlegt eine gespeicherte Storage-URL in Bucket + Pfad
function bucketUndPfad(url: string): { bucket: string; pfad: string } | null {
  const m = url.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+?)(?:\?|$)/);
  return m ? { bucket: m[1], pfad: decodeURIComponent(m[2]) } : null;
}

export async function zertifikatUrl(id: number): Promise<{ url?: string; error?: string }> {
  const supabase = await createClient();

  // Eingeloggter Nutzer
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) return { error: 'Nicht angemeldet.' };

  const { data: ich } = await supabase.from('user').select('id, rolle').eq('user_id', authUser.id).maybeSingle();
  if (!ich) return { error: 'Profil nicht gefunden.' };

  const { data: zert } = await supabaseAdmin
    .from('zertifikat') // ← Tabellenname wie in certificates.ts
    .select('id, file, user, year')
    .eq('id', id)
    .maybeSingle();
  if (!zert?.file) return { error: 'Zertifikat nicht gefunden.' };

  // Berechtigung: Besitzer, zuständiger Bearbeiter oder Admin
  let erlaubt = zert.user === ich.id || ich.rolle === 'admin';
  if (!erlaubt) {
    const { data: besitzer } = await supabaseAdmin.from('user').select('bearbeiter').eq('id', zert.user).maybeSingle();
    erlaubt = besitzer?.bearbeiter === ich.id;
  }
  if (!erlaubt) return { error: 'Keine Berechtigung.' };

  const ziel = bucketUndPfad(zert.file);
  if (!ziel) return { error: 'Dateipfad ungültig.' };

  const endung = ziel.pfad.split('.').pop() || 'pfx';
  const { data, error } = await supabaseAdmin.storage
    .from(ziel.bucket)
    .createSignedUrl(ziel.pfad, 60, { download: `Zertifikat-${zert.year ?? ''}.${endung}` });

  if (error || !data) return { error: 'Download-Link konnte nicht erstellt werden.' };
  return { url: data.signedUrl };
}