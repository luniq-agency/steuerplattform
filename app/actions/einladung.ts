'use server';

import { createClient } from '@/app/utils/supabase/server';
import { supabaseAdmin } from '@/app/utils/supabase/admin';

export async function einladungAnnehmen(
  token: string,
  password: string
): Promise<{ error?: string }> {
  if (password.length < 8) return { error: 'Das Passwort muss mindestens 8 Zeichen lang sein.' };

  // Einladung erneut prüfen, nie dem Client vertrauen
  const { data: einladung } = await supabaseAdmin
    .from('user')
    .select('id, email, user_id')
    .eq('einladung_token', token)
    .maybeSingle();

  if (!einladung || einladung.user_id)
    return { error: 'Diese Einladung ist ungültig oder wurde bereits verwendet.' };
  if (!einladung.email)
    return { error: 'Für diese Einladung ist keine E-Mail-Adresse hinterlegt.' };

  // Auth-Konto anlegen. Die E-Mail gilt als bestätigt, weil der Link per Mail verschickt wurde.
  // Der Trigger on_auth_user_created verknüpft das Konto über die E-Mail mit der vorhandenen Zeile.
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: einladung.email,
    password,
    email_confirm: true,
  });

  if (createError) {
    console.error('Konto konnte nicht angelegt werden:', createError);
    return {
      error: createError.message.includes('already')
        ? 'Für diese E-Mail-Adresse gibt es bereits ein Konto. Bitte melde dich an.'
        : 'Dein Konto konnte nicht angelegt werden. Bitte versuche es erneut.',
    };
  }

  // Link nur einmal verwendbar machen
  await supabaseAdmin.from('user').update({ einladung_token: null }).eq('id', einladung.id);

  // Direkt einloggen (setzt die Session-Cookies)
  const supabase = await createClient();
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: einladung.email,
    password,
  });
  if (loginError)
    return { error: 'Konto angelegt, aber die Anmeldung ist fehlgeschlagen. Bitte melde dich an.' };

  return {};
}

const ERLAUBTE_FELDER = [
  'vorname',
  'nachname',
  'telefon',
  'strasse',
  'hausnummer',
  'plz',
  'ort',
] as const;
type ProfilFelder = Partial<Record<(typeof ERLAUBTE_FELDER)[number], string>>;

export async function profilVervollstaendigen(werte: ProfilFelder): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet.' };

  // Nur erlaubte Felder übernehmen, damit niemand z. B. rolle oder bearbeiter mitschickt
  const sauber = Object.fromEntries(
    ERLAUBTE_FELDER.filter((k) => typeof werte[k] === 'string').map((k) => [k, werte[k]!.trim()])
  );

  const { error } = await supabase.from('user').update(sauber).eq('user_id', user.id);
  if (error) {
    console.error('Profil konnte nicht gespeichert werden:', error);
    return { error: 'Deine Angaben konnten nicht gespeichert werden.' };
  }
  return {};
}
