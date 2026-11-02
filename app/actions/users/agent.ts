'use server';

import { createClient } from '@/app/utils/supabase/server';
import { User } from '../../types/Database';

export async function agentCreate(payload: Partial<User>): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user').insert(payload).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function agentsLoad(): Promise<User[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user').select('*').eq('rolle', 'agent');
  if (error) throw new Error(error.message);
  return data || [];
}
