'use server';
import { Invoice, InvoiceItem, User } from '@/app/types/Database';
import Stripe from 'stripe';
import { createStripeCustomer } from '../stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripePaymentLink(
  invoice: Invoice,
  items: InvoiceItem[],
  recipient: User,
  invoiceNumber: string,
  totalGross: number // ← euer bereits berechneter Bruttobetrag (net + tax)
) {
  let customerId = recipient.stripe_customer_id;
  if (!customerId) {
    customerId = await createStripeCustomer(recipient);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card', 'sepa_debit'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Rechnung ${invoiceNumber}`,
          },
          unit_amount: Math.round(totalGross * 100), // ← Gesamtbetrag, den ihr schon selbst berechnet habt
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rechnung/erfolgreich`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rechnung/abgebrochen`,
    metadata: { invoice_id: String(invoice.id) },
  });

  return {
    stripeSessionId: session.id,
    paymentUrl: session.url,
  };
}
