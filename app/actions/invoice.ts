'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Invoice } from '../types/Database';

export async function invoiceCreate(data: Partial<Invoice>) {
  const supabase = await createClient();
  const { data: created, error } = await supabase.from('invoice').insert(data).select().single();
  if (error) throw new Error(error.message);
  return created;
}

export async function invoiceDelete(id: string) {
  const supabase = await createClient();
  const { data: deleted, error } = await supabase.from('invoice').delete().eq('id', id).single();
  if (error) throw new Error(error.message);
  return deleted;
}

export async function invoiceLoadLatest(): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoice')
    .select('*')
    .order('created_at', { ascending: false })
    .select()

  if (error) throw new Error(error.message);
  return data || [];
}

export async function invoiceSend(id: string, email: string) {
  const supabase = await createClient();

  const { data: sent, error } = await supabase
    .from('invoice')
    .update({ invoice_status: 'sent' })
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);

  return sent;
}

export async function invoiceLoadSingle(id: string): Promise<Invoice> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('invoice').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function invoicesLoadAll(): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('invoice').select('*');
  if (error) throw new Error(error.message);
  return data;
}

export async function invoicesLoadUser(id: string): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('invoice').select('*').eq('user', id);
  if (error) throw new Error(error.message);
  return data;
}

export async function invoicesDeleteMultiple(ids: string[]) {
  const supabase = await createClient();

  const { data: deleted, error } = await supabase.from('invoice').delete().in('id', ids);

  if (error) throw new Error(error.message);

  return deleted;
}

export async function invoiceUpdate(data: Partial<Invoice>, id: string): Promise<Invoice> {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('invoice')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created;
}
