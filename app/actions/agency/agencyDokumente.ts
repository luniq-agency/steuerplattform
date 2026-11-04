'use server';

import { User } from '@/app/types/Database';
import { Dokument, DokumentOrdner } from '@/app/types/docs';
import { Vorgang, Vorgangupdate } from '@/app/types/vorgang';
import { createClient } from '@/app/utils/supabase/server';

export async function fetchDokumenteAgency(
  id: number
): Promise<{ mandanten: User[]; ordner: DokumentOrdner[]; dokumente: Dokument[] }> {
  const supabase = await createClient();
  const leer = { mandanten: [], ordner: [], dokumente: [] };

  // 1. Alle Mandanten des Agenturmitarbeiters
  const { data: mandanten, error: mandantenError } = await supabase
    .from('user')
    .select('*')
    .eq('bearbeiter', id)
    .order('nachname');

  if (mandantenError) {
    console.error('Mandanten konnten nicht geladen werden:', mandantenError);
    return leer;
  }

  if (!mandanten?.length) return leer;

  // 2. Alle Vorgänge dieser Mandanten
  const { data: dokumente, error } = await supabase
    .from('dokument')
    .select()
    .in(
      'user',
      mandanten.map((m) => m.id)
    )

  const { data: ordner, error: Ordnererror } = await supabase
    .from('dokumentordner')
    .select()
    .in(
      'user',
      mandanten.map((m) => m.id)
    )

  if (error) {
    console.error('Vorgänge konnten nicht geladen werden:', error);
    return { mandanten, ordner: [], dokumente: [] };
  }

  return { mandanten, ordner: [], dokumente: dokumente ?? [] };
}
