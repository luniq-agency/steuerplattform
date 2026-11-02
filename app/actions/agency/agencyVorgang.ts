'use server';

import { User } from '@/app/types/Database';
import { Vorgang, Vorgangupdate } from '@/app/types/vorgang';
import { createClient } from '@/app/utils/supabase/server';

// CREATE
export async function putVorgang(payload: Partial<Vorgang>): Promise<Vorgang> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang').insert(payload).select().single();
  return data;
}

export async function putVorgangUpdate(payload: Partial<Vorgangupdate>): Promise<Vorgangupdate> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang_update').insert(payload).select().single();
  return data;
}

// READ
export async function fetchVorgaengeAgency(
  id: number
): Promise<{ mandanten: User[]; vorgaenge: Vorgang[] }> {
  const supabase = await createClient();
  const leer = { mandanten: [], vorgaenge: [] };

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
  const { data: vorgaenge, error } = await supabase
    .from('vorgang')
    .select()
    .in('user', mandanten.map((m) => m.id))
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('Vorgänge konnten nicht geladen werden:', error);
    return { mandanten, vorgaenge: [] };
  }

  return { mandanten, vorgaenge: vorgaenge ?? [] };
}

export async function fetchVorgangById(id: string | number): Promise<Vorgang> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang').select().eq('id', id).single();
  return data;
}

// UPDATE
export async function patchVorgang(
  payload: Partial<Vorgang>,
  id: string | number
): Promise<Vorgang> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang').update(payload).select().eq('id', id).single();
  return data;
}

// DELETE
export async function deleteVorgang(id: string | number) {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang').delete().eq('id', id);
  return data;
}
