'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Invoice, InvoiceItem, User } from '@/app/types/Database';
import Stripe from 'stripe';
import { createStripeCustomer } from '../stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripeInvoice(
  invoice: Invoice,
  items: InvoiceItem[],
  recipient: User,
  invoiceNumber: string
) {
  let customerId = recipient.stripe_customer_id;

  if (!customerId) {
    customerId = await createStripeCustomer(recipient);
  }

  const stripeInvoice = await stripe.invoices.create({
    automatic_tax: { enabled: true },
    customer: customerId,
    collection_method: 'send_invoice',
    days_until_due: 14,
    custom_fields: [{ name: 'Rechnungsnummer', value: invoiceNumber }],
    metadata: { invoice_id: String(invoice.id) },
  });

  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: stripeInvoice.id,
      description: item.description || 'Leistung',
      amount: Math.round(item.price_total * 100), // in Cent
      currency: 'eur',
    });
  }

  await stripe.invoices.finalizeInvoice(stripeInvoice.id);
  const sent = await stripe.invoices.sendInvoice(stripeInvoice.id);

  return {
    stripeInvoiceId: sent.id,
    paymentUrl: sent.hosted_invoice_url,
  };
}
