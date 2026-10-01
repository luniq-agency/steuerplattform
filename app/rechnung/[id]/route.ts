// app/rechnung/bezahlen/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const base = process.env.NEXT_PUBLIC_BASE_URL!;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: invoice } = await supabase.from('invoice').select('*').eq('id', id).single();

  if (!invoice) return NextResponse.redirect(`${base}/rechnung/abgebrochen`);
  if (invoice.invoice_status === 'paid')
    return NextResponse.redirect(`${base}/rechnung/erfolgreich`);

  // Noch offene Session wiederverwenden, sonst neue erstellen
  if (invoice.stripe_session_id) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(invoice.stripe_session_id);
      if (existing.status === 'open' && existing.url) {
        return NextResponse.redirect(existing.url);
      }
    } catch {}
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: invoice.stripe_customer_id ?? undefined,
    payment_method_types: ['card', 'sepa_debit'],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          product_data: { name: `Rechnung ${invoice.invoice_number}` },
          unit_amount: Math.round(invoice.invoice_total_gross * 100),
        },
      },
    ],
    metadata: { invoice_id: String(invoice.id) },
    success_url: `${base}/rechnung/erfolgreich`,
    cancel_url: `${base}/rechnung/abgebrochen`,
  });

  await supabase.from('invoice').update({ stripe_session_id: session.id }).eq('id', invoice.id);

  return NextResponse.redirect(session.url!);
}
