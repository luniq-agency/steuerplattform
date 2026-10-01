'use server';

import { createClient } from '@/app/utils/supabase/server';
import { InvoiceItem } from '../types/Database';

export async function invoiceItemCreate(data: Partial<InvoiceItem>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('invoice_items')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created;
}

export async function invoiceItemDelete(id: string) {
  const supabase = await createClient();

  const { data: deleted, error } = await supabase.from('invoice_items').delete().eq('id', id);

  if (error) throw new Error(error.message);

  return deleted;
}

export async function invoiceItemsLoad(id: string): Promise<InvoiceItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('invoice_items').select('*').eq('invoice', id);

  if (error) throw new Error(error.message);
  return data;
}

export async function invoiceItemUpdate(data: Partial<InvoiceItem>, id: string) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('invoice_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created;
}
