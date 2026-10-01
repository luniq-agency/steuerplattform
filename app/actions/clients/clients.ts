'use server';

import { createClient } from '@/app/utils/supabase/server';
import { User } from '@/app/types/Database';

export async function clientsLoad(user: User): Promise<User[]> {
  const supabase = await createClient();

  let query = supabase.from('user').select('*').eq('user_role', 'client');

  if (user.user_role === 'agency') {
    query = query.eq('bearbeiter', user.id);
  } else if (user.user_role !== 'admin') {
    throw new Error(`Unbekannte Rolle: ${user.user_role}`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
}
