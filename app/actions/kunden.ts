'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Kunde } from '../types/clients';

// POST
export async function createKunde(payload: Partial<Kunde>): Promise<Kunde> {
  const supabase = await createClient();
  const { data } = await supabase.from('kunde').insert(payload).select('*').single();
  return data;
}

// FETCH
export async function fetchKundeById(id: string | number): Promise<Kunde> {
  const supabase = await createClient();
  const { data } = await supabase.from('kunde').select('*').eq('id', id).single();
  return data;
}

export async function fetchKundenByTeam(team: string | number): Promise<Kunde[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('kunde').select('*').eq('team', team);
  return data || [];
}

// PATCH
export async function updateKunde(payload: Partial<Kunde>, id: string | number): Promise<Kunde> {
  const supabase = await createClient();
  const { data } = await supabase.from('kunde').update(payload).eq('id', id).select('*').single();
  return data;
}
