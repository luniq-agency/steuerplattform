'use server';

import { createClient } from '@/app/utils/supabase/server';

export type RechnungStatistik = {
  gesamt_anzahl: number;
  gesamt_summe: number;
  bezahlt_anzahl: number;
  bezahlt_summe: number;
  offen_anzahl: number;
  offen_summe: number;
};

export async function fetchRechnungStatistik(
  team: string | number,
  monat: string
): Promise<RechnungStatistik | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc('rechnung_statistik', {
      p_team_id: team,
      p_monat: `${monat}-01`,
    })
    .single();

  if (error) {
    console.error('Statistik konnte nicht geladen werden:', error);
    return null;
  }

  return data as RechnungStatistik;
}
