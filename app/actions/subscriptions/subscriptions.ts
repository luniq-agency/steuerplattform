'use server';

import { createClient } from '@/app/utils/supabase/server';
import Stripe from 'stripe';
import { Subscription } from '@/app/types/Database';

export async function subscriptionsLoad(): Promise<Subscription[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('subscription')
    .select('*')
    .order('amount_total', { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}
