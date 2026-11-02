'use server';

import { createClient } from '@/app/utils/supabase/server';

export type AusgabeStatistik = {
  gesamt_anzahl: number;
  gesamt_summe: number;
  steuern_summe: number;
  bezahlt_anzahl: number;
  bezahlt_summe: number;
  offen_anzahl: number;
  offen_summe: number;
};

// monat im Format 'YYYY-MM'
export async function fetchAusgabeStatistik(
  team: string | number,
  monat: string
): Promise<AusgabeStatistik | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('ausgabe_statistik', {
      p_team_id: team,
      p_monat: `${monat}-01`,
    })
    .single();

  if (error) {
    console.error('Ausgaben-Statistik konnte nicht geladen werden:', error);
    return null;
  }

  return data as AusgabeStatistik;
}
