'use server';

import { createClient } from '@/app/utils/supabase/server';
import { User } from '@/app/types/Database';

export async function fetchClientsForAgent(id: number): Promise<User[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('user').select('*').eq('bearbeiter', id);
  return data || [];
}
