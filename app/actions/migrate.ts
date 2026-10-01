'use server';

import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { createStripeCustomer } from './stripe';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function registerBubbleUser(email: string, password: string) {
  const supabase = await createClient();

  const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password });
  if (signupError) throw new Error(signupError.message);

  const { data: userProfile, error: userError } = await supabase
    .from('user')
    .update({ user_uuid: signupData.user?.id })
    .eq('email', email)
    .select()
    .single();
  if (userError) throw new Error(userError.message);

  if (userProfile.user_role === 'agency' || userProfile.user.role === 'admin') redirect('/admin');
  if (userProfile.user_role === 'client') redirect('/dashboard');

  return signupData;
}

export async function migrateToStripe() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user').select('*').is('stripe_customer_id', null);
  console.log(data);

  if (!data) return;

  const results = [];
  for (const d of data) {
    const result = await createStripeCustomer(d);
    results.push(result);
    await delay(150);
  }
}
