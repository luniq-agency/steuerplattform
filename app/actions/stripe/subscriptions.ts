'use server';

import Stripe from 'stripe';
import { createStripeCustomer } from '../stripe';
import { User } from '@/app/types/Database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface CreateSubscriptionParams {
  user: User;
  planName: string;
  amountGross: number; // Brutto in Euro, z.B. 29.9
  startDate?: Date; // optionaler Starttermin, sonst sofort
  invoiceId?: number | string; // eure interne Rechnung zur Zuordnung
}

export async function createStripeSubscription({
  user,
  planName,
  amountGross,
  startDate,
  invoiceId,
}: CreateSubscriptionParams) {
  // 1. Customer sicherstellen
  let customerId = user.stripe_customer_id;
  if (!customerId) {
    customerId = await createStripeCustomer(user);
  }
  if (!customerId) throw new Error('Stripe Customer konnte nicht erstellt werden');

  // 2. Checkout Session im Modus "subscription"
  //    Der Kunde bestätigt damit die erste Zahlung und hinterlegt Karte/SEPA
  const trialEnd =
    startDate && startDate.getTime() > Date.now()
      ? Math.floor(startDate.getTime() / 1000)
      : undefined;

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    payment_method_types: ['card', 'sepa_debit'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          recurring: { interval: 'month' },
          unit_amount: Math.round(amountGross * 100),
          product_data: { name: planName },
        },
      },
    ],
    subscription_data: {
      // Startet das Abo erst am Wunschdatum, bis dahin keine Abbuchung
      ...(trialEnd ? { trial_end: trialEnd } : {}),
      metadata: {
        user_id: String(user.id),
        ...(invoiceId ? { invoice_id: String(invoiceId) } : {}),
      },
    },
    metadata: {
      user_id: String(user.id),
      ...(invoiceId ? { invoice_id: String(invoiceId) } : {}),
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rechnung/erfolgreich`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rechnung/abgebrochen`,
  });

  return {
    sessionId: session.id,
    paymentUrl: session.url,
  };
}

export async function cancelStripeSubscription(subscriptionId: string) {
  // Kündigt zum Ende der laufenden Periode
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}
