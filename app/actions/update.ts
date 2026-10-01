'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Client, User, UserUpdate } from '../types/Database';

export async function userUpdateCreate(data: Partial<UserUpdate>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('user_update')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created;
}

export async function userUpdatesLoad(id: string): Promise<UserUpdate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user_update').select('*').eq('user', id);

  if (error) throw new Error(error.message);

  return data || [];
}
