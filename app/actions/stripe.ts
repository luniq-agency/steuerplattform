'use server';

import { createClient } from '@/app/utils/supabase/server';
import Stripe from 'stripe';
import { User } from '../types/Database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function createStripeCustomer(client: User) {
  const supabase = await createClient();
  const customer = await stripe.customers.create({
    address: {
      city: client.city || '',
      country: 'DE',
      line1: client.anschrift || '',
      postal_code: client.plz || '',
    },
    email: client.email || '',
    name: `${client.user_name_first} ${client.user_name_last}`,
    phone: client.telefon || '',
  });

  // Customer ID in Supabase speichern
  await supabase.from('user').update({ stripe_customer_id: customer.id }).eq('id', client.id);

  return customer.id;
}

export async function updateStripeCustomers() {
  const supabase = await createClient();
  const customers = await stripe.customers.list({
    limit: 100,
  });
  const emails = customers.data.map((c) => c.email).filter((email): email is string => !!email);

  const { data, error } = await supabase
    .from('user')
    .select('*')
    .not('email', 'in', `(${emails.join(',')})`);

  if (!data) return;

  const results = [];
  for (const d of data) {
    const result = await createStripeCustomer(d);
    results.push(result);
    await delay(150);
  }
}
