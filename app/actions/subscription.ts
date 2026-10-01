'use server';

import { createClient } from '@/app/utils/supabase/server';
import Stripe from 'stripe';
import { Invoice, SubscriptionItem } from '../types/Database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripeCustomer(id: string, email: string, name: string) {
  const supabase = await createClient();
  const customer = await stripe.customers.create({ email, name });

  // Customer ID in Supabase speichern
  await supabase.from('user').update({ stripe_customer_id: customer.id }).eq('id', id);

  return customer.id;
}

export async function createSubscription(
  customerId: string,
  stripePriceId: string,
  userId: string,
  startDate?: number
) {
  const isDev = process.env.NODE_ENV === 'development';
  const item = isDev ? 'price_1UAp14EU3GZOBU2i2a18fHuZ' : stripePriceId;

  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: item }],
    billing_cycle_anchor: startDate,
    proration_behavior: 'none',
    collection_method: 'send_invoice',
    days_until_due: 14,
    metadata: { userId: userId },
    payment_settings: {
      payment_method_types: ['card', 'sepa_debit'],
    },
  });

  return {
    subscriptionId: subscription.id,
  };
}

export async function subscriptionsGetForUser(id: string): Promise<Invoice[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invoice')
    .select('*')
    .eq('user', id)
    .eq('subscription', true)
    .order('invoice_date', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
