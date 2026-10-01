'use server';

import { createClient } from '@/app/utils/supabase/server';
import { User } from '@/app/types/Database';

export async function agencyGetSignups(id: string) {
  const supabase = await createClient();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('user_role', 'client')
    .eq('referrer', id)
    .gte('created_at', monthStart)
    .lte('created_at', monthEnd);

  if (error || !data) return [];
  return data;
}
