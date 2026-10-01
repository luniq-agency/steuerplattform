'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Ticket, TicketEntry } from '../types/Database';

export async function ticketCreate(data: Partial<Ticket>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase.from('ticket').insert(data).select().single();

  if (error) throw new Error(error.message);

  return created;
}

export async function ticketLoadSingle(id: string): Promise<Ticket> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('ticket').select('*').eq('id', id).select().single();

  if (error) throw new Error(error.message);
  return data;
}

export async function ticketsLoadAll() {
  const supabase = await createClient();

  const { data, error } = await supabase.from('ticket').select('*');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function ticketsLoadUser(id: string): Promise<Ticket[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('ticket').select('*').eq('created_by', id);

  if (error) throw new Error(error.message);
  return data || [];
}

// ENTRIES
export async function ticketEntryCreate(data: Partial<TicketEntry>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('ticket_entry')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function ticketEntriesLoadTicket(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('ticket_entry')
    .select('*')
    .eq('ticket', id)
    .order('created_at', { ascending: true });

  return data || [];
}
