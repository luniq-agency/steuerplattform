'use server';

import { createClient } from '@/app/utils/supabase/server';
import { erkenneBeleg } from '@/app/utils/belege/pipeline';
import { lieferantKey } from '@/app/utils/belege/extraktion';
import type { BelegErgebnis, BelegFelder } from '@/app/utils/belege/types';
import { Ausgabe } from '@/app/types/ausgaben';

const BUCKET = 'belege';

export type BelegVerarbeitet = Omit<BelegErgebnis, 'rohtext'> & {
  id: number;
  konto: string | null; // Vorschlag aus der Historie des Teams
  duplikat: number | null; // ID einer möglichen Doppelbuchung
};

async function aktuellerUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profil } = await supabase
    .from('user')
    .select('id, team_aktiv')
    .eq('user_id', user.id)
    .single();
  if (!profil?.team_aktiv) return null;
  return { supabase, profilId: profil.id as number, team: profil.team_aktiv as number };
}

/**
 * Beleg auslesen, nachdem der Client die Datei in Storage hochgeladen hat.
 * @param pfad Pfad im Bucket "belege", z. B. "12/2026-11/beleg.pdf"
 */
export async function belegVerarbeiten(
  pfad: string,
  dateiname: string,
  mimeType: string
): Promise<{ data?: BelegVerarbeitet; error?: string }> {
  const ctx = await aktuellerUser();
  if (!ctx) return { error: 'Nicht angemeldet oder kein aktives Team.' };
  const { supabase, profilId, team } = ctx;

  // Nur Dateien im eigenen Team-Ordner verarbeiten
  if (!pfad.startsWith(`${team}/`)) return { error: 'Ungültiger Dateipfad.' };

  const { data: datei, error: downloadError } = await supabase.storage.from(BUCKET).download(pfad);
  if (downloadError || !datei) return { error: 'Die Datei konnte nicht geladen werden.' };

  // Bekannte Lieferanten des Teams verbessern die Erkennung
  const { data: bekannt } = await supabase
    .from('lieferant_konto')
    .select('lieferant')
    .eq('team', team);
  const lieferanten = [...new Set((bekannt ?? []).map((l) => l.lieferant as string))];

  const erkannt = await erkenneBeleg(
    new Uint8Array(await datei.arrayBuffer()),
    dateiname,
    mimeType,
    lieferanten
  );
  const f = erkannt.felder;

  // Kontovorschlag aus der Historie
  let konto: string | null = null;
  if (f.lieferant) {
    const { data } = await supabase
      .from('lieferant_konto')
      .select('konto')
      .eq('team', team)
      .eq('lieferant_key', lieferantKey(f.lieferant))
      .order('anzahl', { ascending: false })
      .limit(1)
      .maybeSingle();
    konto = data?.konto ?? null;
  }

  // Mögliche Doppelbuchung: gleiche Rechnungsnummer und gleicher Betrag im Team
  let duplikat: number | null = null;
  if (f.rechnungsnummer && f.betrag_brutto != null) {
    const { data } = await supabase
      .from('ausgabe')
      .select('id')
      .eq('team', team)
      .eq('rechnungsnummer', f.rechnungsnummer)
      .eq('betrag_brutto', f.betrag_brutto)
      .limit(1)
      .maybeSingle();
    duplikat = data?.id ?? null;
  }
  if (duplikat)
    erkannt.hinweise.push(
      'Ein Beleg mit gleicher Rechnungsnummer und gleichem Betrag existiert bereits.'
    );

  const { data: ausgabe, error } = await supabase
    .from('ausgabe')
    .insert({
      beleg: pfad,
      bezeichnung: f.rechnungsnummer ? `Rechnung ${f.rechnungsnummer}` : dateiname,
      lieferant: f.lieferant,
      rechnungsnummer: f.rechnungsnummer,
      datum: f.datum,
      betrag_netto: f.betrag_netto,
      betrag_steuern: f.betrag_steuern,
      betrag_brutto: f.betrag_brutto,
      betrag_gesamt: f.betrag_brutto,
      steuersatz: f.steuersatz,
      waehrung: f.waehrung ?? 'EUR',
      konto,
      quelle: erkannt.quelle,
      konfidenz: erkannt.konfidenz,
      bestaetigt: false,
      extraktion: {
        felder: f,
        pruefen: erkannt.pruefen,
        hinweise: erkannt.hinweise,
        rohtext: erkannt.rohtext?.slice(0, 20000) ?? null, // für späteren LLM-Fallback
      },
      team,
      created_by: profilId,
    })
    .select('id')
    .single();

  if (error || !ausgabe) {
    console.error('Ausgabe konnte nicht angelegt werden:', error);
    return { error: 'Der Beleg konnte nicht gespeichert werden.' };
  }

  const { rohtext: _rohtext, ...ohneRohtext } = erkannt;
  return { data: { ...ohneRohtext, id: ausgabe.id, konto, duplikat } };
}

/** Vom Nutzer geprüfte Werte speichern und den Kontovorschlag für diesen Lieferanten lernen. */
export async function belegBestaetigen(
  id: number,
  werte: Partial<BelegFelder> & { konto?: string | null }
): Promise<{ error?: string }> {
  const ctx = await aktuellerUser();
  if (!ctx) return { error: 'Nicht angemeldet oder kein aktives Team.' };
  const { supabase, team } = ctx;

  const { error } = await supabase
    .from('ausgabe')
    .update({
      lieferant: werte.lieferant,
      rechnungsnummer: werte.rechnungsnummer,
      datum: werte.datum,
      betrag_netto: werte.betrag_netto,
      betrag_steuern: werte.betrag_steuern,
      betrag_brutto: werte.betrag_brutto,
      betrag_gesamt: werte.betrag_brutto,
      steuersatz: werte.steuersatz,
      waehrung: werte.waehrung,
      konto: werte.konto,
      bestaetigt: true,
    })
    .eq('id', id)
    .eq('team', team);

  if (error) {
    console.error('Beleg konnte nicht bestätigt werden:', error);
    return { error: 'Die Änderungen konnten nicht gespeichert werden.' };
  }

  if (werte.lieferant && werte.konto) {
    const { error: lernError } = await supabase.rpc('lieferant_konto_lernen', {
      p_team: team,
      p_lieferant_key: lieferantKey(werte.lieferant),
      p_lieferant: werte.lieferant,
      p_konto: werte.konto,
    });
    if (lernError) console.error('Kontovorschlag konnte nicht gelernt werden:', lernError);
  }

  return {};
}

export async function fetchBelegeForTeam(team: number): Promise<Ausgabe[]> {
  const supabase = await createClient();
  const {data} = await supabase.from('ausgabe').select('*').eq('team', team);
  return data || [];
}
