'use server';

import { User } from '@/app/types/Database';
import { Dokument, DokumentOrdner } from '@/app/types/docs';
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

  const ids = mandanten.map((m) => m.id);

  // 2. Dokumente + Ordner dieser Mandanten (parallel)
  const [{ data: dokumente, error: dokError }, { data: ordner, error: ordnerError }] = await Promise.all([
    supabase.from('dokument').select('*').in('user', ids).order('created_at', { ascending: false }),
    supabase.from('dokumentordner').select('*').in('user', ids),
  ]);

  if (dokError) console.error('Dokumente konnten nicht geladen werden:', dokError);
  if (ordnerError) console.error('Ordner konnten nicht geladen werden:', ordnerError);

  return { mandanten, ordner: ordner ?? [], dokumente: dokumente ?? [] };
}