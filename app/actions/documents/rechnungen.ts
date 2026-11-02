'use server';

import { Rechnung, Rechnungsposten } from '@/app/types/rechnung/Rechnungen';
import { createClient } from '@/app/utils/supabase/server';

// FETCH
export async function fetchInvoiceById(id: string | number): Promise<Rechnung> {
  const supabase = await createClient();
  const { data } = await supabase.from('rechnung').select('*').eq('id', id).single();
  return data;
}

export async function fetchInvoicesByTeam(team: string | number): Promise<Rechnung[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('rechnung').select('*').eq('team', team);
  return data || [];
}

export async function fetchInvoicePositions(id: string | number): Promise<Rechnungsposten[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('rechnungsposten').select('*').eq('rechnung', id);
  return data || [];
}
