'use server';

import { createClient } from '@/app/utils/supabase/server';
import { EmailTemplate } from '../types/Database';

export async function emailTemplateCreate(data: Partial<EmailTemplate>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('email_template')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function emailTemplateLoad(id: string): Promise<EmailTemplate> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('email_template').select('*').eq('id', id).single();

  if (error) throw new Error(error.message);
  return data;
}

export async function emailTemplateUpdate(data: Partial<EmailTemplate>, id: string) {
  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from('email_template')
    .update(data)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function emailTemplatesLoad(): Promise<EmailTemplate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('email_template').select('*');

  if (error) throw new Error(error.message);
  return data || [];
}
