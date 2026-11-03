'use server';

import Stripe from 'stripe';
import { createClient } from '@/app/utils/supabase/server';
import { saveInvoice } from '@/app/actions/rechnung';
import { adminPruefen, cents, euro, steuersatzId, stripe, stripeKundeSicherstellen, type Adresse } from '@/app/utils/stripe/helpers';
import type { TempPosten } from '../types/rechnung/Rechnungen';

export type AdminRechnungInput = {
  mandantId: number;
  positionen: TempPosten[];
  steuersatz: number;        // 0.19
  bezahlziel: string | null; // 'YYYY-MM-DD'
  adresse: Adresse;
  idempotencyKey: string;    // pro Rechnung im Browser erzeugt, verhindert Doppelversand
};

export type AdminRechnungErgebnis = {
  error?: string;
  rechnungId?: string;
  rechnungsnummer?: string;
  stripeUrl?: string;
};

const tageBis = (datum: string | null) => {
  if (!datum) return 14;
  const ziel = new Date(`${datum}T00:00:00`);
  const heute = new Date(new Date().toDateString());
  return Math.max(1, Math.round((ziel.getTime() - heute.getTime()) / 86_400_000));
};

export async function adminCreateInvoice(input: AdminRechnungInput): Promise<AdminRechnungErgebnis> {
  const supabase = await createClient();

  const adminId = await adminPruefen(supabase);
  if (!adminId) return { error: 'Keine Berechtigung.' };

  const positionen = input.positionen.filter((p) => p.beschreibung.trim() && p.gesamtpreis > 0);
  if (!positionen.length) return { error: 'Die Rechnung braucht mindestens einen Posten mit Betrag.' };

  const { data: mandant } = await supabase.from('user').select('*').eq('id', input.mandantId).single();
  if (!mandant) return { error: 'Mandant nicht gefunden.' };
  if (!input.adresse.email && !mandant.email) return { error: 'Für den Mandanten ist keine E-Mail-Adresse hinterlegt.' };

  let stripeInvoiceId: string | null = null;

  try {
    // 1. Stripe-Kunde
    const customerId = await stripeKundeSicherstellen(supabase, mandant, input.adresse);

    // 2. Rechnung als Entwurf (bei Wiederholung liefert der Idempotency-Key dieselbe Rechnung)
    const taxRate = await steuersatzId(Math.round(input.steuersatz * 100));
    const erstellt = await stripe().invoices.create(
      {
        customer: customerId,
        collection_method: 'send_invoice',
        days_until_due: tageBis(input.bezahlziel),
        currency: 'eur',
        auto_advance: false,
        default_tax_rates: [taxRate],
        pending_invoice_items_behavior: 'exclude',
        metadata: { advact_user_id: String(mandant.id), erstellt_von: String(adminId) },
      },
      { idempotencyKey: input.idempotencyKey }
    );
    stripeInvoiceId = erstellt.id!;

    // Aktuellen Stand holen – die Antwort oben kann bei Wiederholung zwischengespeichert sein
    let final = await stripe().invoices.retrieve(stripeInvoiceId);

    if (final.status === 'draft') {
      if (!final.lines?.data.length) {
        for (const p of positionen) {
          await stripe().invoiceItems.create({
            customer: customerId,
            invoice: stripeInvoiceId,
            currency: 'eur',
            amount: cents(p.gesamtpreis),
            description:
              p.menge === 1
                ? p.beschreibung
                : `${p.beschreibung} (${p.menge} × ${p.einzelpreis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })})`,
          });
        }
      }
      // 3. Finalisieren: Stripe vergibt Nummer und berechnet die Steuer
      final = await stripe().invoices.finalizeInvoice(stripeInvoiceId);
    }

    // 4. Lokale Kopie
    const lokal = await saveInvoice(
      {
        betrag_netto: euro(final.subtotal),
        betrag_steuern: euro(final.total - final.subtotal),
        betrag_gesamt: euro(final.total),
        bezahlziel: final.due_date ? new Date(final.due_date * 1000).toISOString().slice(0, 10) : input.bezahlziel,
        created_by: adminId,
        empfaenger: `${mandant.vorname ?? ''} ${mandant.nachname ?? ''}`.trim(),
        strasse: input.adresse.strasse,
        hausnummer: input.adresse.hausnummer,
        kunde: null,
        plz: input.adresse.plz,
        ort: input.adresse.ort,
        land: 'DE',
        mandant: mandant.id,
        rechnungsdatum: new Date().toISOString().slice(0, 10),
        rechnungsnummer: final.number ?? '',
        status: 'offen',
        steuersatz: input.steuersatz,
        stripe_invoice_id: final.id,
        stripe_url: final.hosted_invoice_url,
        stripe_pdf: final.invoice_pdf,
      },
      positionen
    );

    if (lokal.error || !lokal.id) {
      console.error('Lokale Kopie fehlgeschlagen:', lokal.error);
      return {
        error: `Rechnung ${final.number} wurde in Stripe erstellt, aber nicht lokal gespeichert und deshalb noch nicht versendet.`,
      };
    }

    // 5. Über Stripe versenden
    await stripe().invoices.sendInvoice(stripeInvoiceId);

    return {
      rechnungId: lokal.id,
      rechnungsnummer: final.number ?? undefined,
      stripeUrl: final.hosted_invoice_url ?? undefined,
    };
  } catch (err) {
    console.error('Stripe-Rechnung fehlgeschlagen:', err instanceof Stripe.errors.StripeError ? err.message : err);
    if (stripeInvoiceId) {
      const inv = await stripe().invoices.retrieve(stripeInvoiceId).catch(() => null);
      if (inv?.status === 'draft') await stripe().invoices.del(stripeInvoiceId).catch(() => null);
    }
    return { error: err instanceof Stripe.errors.StripeError ? err.message : 'Die Rechnung konnte nicht erstellt werden.' };
  }
}