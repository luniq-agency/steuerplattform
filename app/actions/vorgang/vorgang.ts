'use server';

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
export async function fetchVorgaengeByClient(id: string | number): Promise<Vorgang[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang').select().eq('created_by', id);
  return data || [];
}

export async function fetchVorgangById(id: string | number): Promise<Vorgang> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang').select().eq('id', id).single();
  return data;
}

export async function fetchVorgaengeAll(): Promise<Vorgang[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang').select();
  return data || [];
}

export async function fetchVorgangUpdates(id: number): Promise<Vorgangupdate[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('vorgang_update').select().eq('vorgang', id);
  return data || [];
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
