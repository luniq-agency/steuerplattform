'use server';

import { createClient } from '@/app/utils/supabase/server';
import { User } from '@/app/types/Database';

export async function clientsLoad(user: User): Promise<User[]> {
  const supabase = await createClient();

  let query = supabase.from('user').select('*').eq('rolle', 'client');

  if (user.rolle === 'agency') {
    query = query.eq('bearbeiter', user.id);
  } else if (user.rolle !== 'admin') {
    throw new Error(`Unbekannte Rolle: ${user.rolle}`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
}
