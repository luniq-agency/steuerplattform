'use server';

import { createClient } from '@/app/utils/supabase/server';
import { zielFuerRolle } from '@/app/utils/roles';

const FELDER = [
  'vorname',
  'nachname',
  'geburtsdatum',
  'telefon',
  'strasse',
  'hausnummer',
  'plz',
  'ort',
  'berufsstatus',
  'beruf',
  'familienstand',
  'kinder',
  'steuer_id',
  'iban',
] as const;

export type OnboardingWerte = Partial<Record<(typeof FELDER)[number], string | number | null>>;
export type TeamWahl = { modus: 'einzel' } | { modus: 'team'; name: string };

export async function onboardingAbschliessen(
  werte: OnboardingWerte,
  teamWahl: TeamWahl
): Promise<{ error?: string; ziel?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet.' };

  const { data: profil } = await supabase
    .from('user')
    .select('id, rolle, team_aktiv')
    .eq('user_id', user.id)
    .single();
  if (!profil) return { error: 'Dein Profil wurde nicht gefunden.' };

  if (teamWahl.modus === 'team' && teamWahl.name.trim().length < 2) {
    return { error: 'Bitte gib deinem Team einen Namen.' };
  }

  // 1. Profildaten: nur erlaubte Felder, Texte trimmen
  const sauber: Record<string, string | number | null> = {};
  for (const k of FELDER) {
    const v = werte[k];
    if (v === undefined) continue;
    sauber[k] = typeof v === 'string' ? v.trim() || null : v;
  }
  if (typeof sauber.iban === 'string') sauber.iban = sauber.iban.replace(/\s/g, '').toUpperCase();

  // 2. Team anlegen, falls noch keins aktiv ist
  let teamId: number | null = profil.team_aktiv ?? null;

  if (!teamId) {
    const name =
      teamWahl.modus === 'team'
        ? teamWahl.name.trim()
        : `${sauber.vorname ?? ''} ${sauber.nachname ?? ''}`.trim() || 'Mein Konto';

    const { data: team, error: teamError } = await supabase
      .from('team')
      .insert({ team_name: name, created_by: profil.id, einzelkonto: teamWahl.modus === 'einzel' })
      .select('id')
      .single();

    if (teamError || !team) {
      console.error('Team konnte nicht angelegt werden:', teamError);
      return { error: 'Dein Konto konnte nicht eingerichtet werden. Bitte versuche es erneut.' };
    }
    teamId = team.id;

    const { error: mitgliedError } = await supabase
      .from('teammitglied')
      .insert({ team: teamId, user: profil.id, rolle: 'Admin' });

    if (mitgliedError) {
      console.error('Mitgliedschaft konnte nicht angelegt werden:', mitgliedError);
      await supabase.from('team').delete().eq('id', teamId); // aufräumen
      return { error: 'Dein Konto konnte nicht eingerichtet werden. Bitte versuche es erneut.' };
    }
  }

  // 3. Profil abschließen und Team aktiv setzen
  const { error } = await supabase
    .from('user')
    .update({ ...sauber, team_aktiv: teamId, onboarding_completed: true, status: 'in_review' })
    .eq('id', profil.id);

  if (error) {
    console.error('Onboarding konnte nicht gespeichert werden:', error);
    return { error: 'Deine Angaben konnten nicht gespeichert werden. Bitte versuche es erneut.' };
  }

  return { ziel: zielFuerRolle(profil.rolle) };
}
