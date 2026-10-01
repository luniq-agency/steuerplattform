// api/webhooks/stripe/route.ts (Next.js Route Handler)
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { invoiceUpdate } from '@/app/actions/invoice';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id;

    if (invoiceId) {
      await invoiceUpdate({ invoice_status: 'paid' }, invoiceId);
    }
  }

  return new Response('OK', { status: 200 });
}
