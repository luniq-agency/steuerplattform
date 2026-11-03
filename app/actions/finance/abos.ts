'use server';

import Stripe from 'stripe';
import { createClient } from '@/app/utils/supabase/server';
import {
  adminPruefen,
  cents,
  steuersatzId,
  stripe,
  stripeKundeSicherstellen,
  type Adresse,
} from '@/app/utils/stripe/helpers';
import type { Abonnement, AboIntervall } from '@/app/types/abos';
import type { TempPosten } from '@/app/types/rechnung/Rechnungen';

export type AboInput = {
  mandantId: number;
  bezeichnung: string;
  intervall: AboIntervall;
  positionen: TempPosten[];
  steuersatz: number; // 0.19
  zahlungszielTage: number; // z. B. 14
  adresse: Adresse;
  idempotencyKey: string;
};

export type AboUpdateInput = Omit<AboInput, 'mandantId' | 'intervall'>;

export type AboRechnung = {
  id: number;
  abo: number | null;
  rechnungsnummer: string | null;
  rechnungsdatum: string | null;
  betrag_gesamt: number;
  status: string | null;
  stripe_url: string | null;
};

const INTERVALLE: Record<AboIntervall, { interval: 'month' | 'year'; interval_count: number }> = {
  monat: { interval: 'month', interval_count: 1 },
  quartal: { interval: 'month', interval_count: 3 },
  jahr: { interval: 'year', interval_count: 1 },
};

const datum = (unix: number | null | undefined) =>
  unix ? new Date(unix * 1000).toISOString().slice(0, 10) : null;

const gueltigePosten = (positionen: TempPosten[]) =>
  positionen.filter((p) => p.beschreibung.trim() && p.einzelpreis > 0 && p.menge > 0);

const summen = (positionen: TempPosten[], steuersatz: number) => {
  const netto = Math.round(positionen.reduce((s, p) => s + p.menge * p.einzelpreis, 0) * 100) / 100;
  return { netto, brutto: Math.round(netto * (1 + steuersatz) * 100) / 100 };
};

/** Pro Posten ein Produkt anlegen und daraus Abo-Posten mit Preis bauen. */
async function aboPosten(
  positionen: TempPosten[],
  intervall: AboIntervall,
  aboId: number,
  keyPrefix: string
): Promise<{ price_data: Stripe.SubscriptionCreateParams.Item.PriceData; quantity: number }[]> {
  const items = [];
  for (const p of positionen) {
    const produkt = await stripe().products.create(
      { name: p.beschreibung.trim(), metadata: { advact_abo_id: String(aboId) } },
      { idempotencyKey: `${keyPrefix}-produkt-${p.id}` }
    );
    items.push({
      quantity: p.menge,
      price_data: {
        currency: 'eur',
        product: produkt.id,
        unit_amount: cents(p.einzelpreis),
        recurring: INTERVALLE[intervall],
      },
    });
  }
  return items;
}

// ---------- Anlegen ----------

export async function adminCreateAbo(input: AboInput): Promise<{ error?: string; aboId?: number }> {
  const supabase = await createClient();

  const adminId = await adminPruefen(supabase);
  if (!adminId) return { error: 'Keine Berechtigung.' };

  const positionen = gueltigePosten(input.positionen);
  if (!input.bezeichnung.trim()) return { error: 'Bitte gib dem Abo eine Bezeichnung.' };
  if (!positionen.length) return { error: 'Das Abo braucht mindestens einen Posten mit Betrag.' };
  if (!INTERVALLE[input.intervall]) return { error: 'Ungültiges Abrechnungsintervall.' };

  const { data: mandant } = await supabase
    .from('user')
    .select('*')
    .eq('id', input.mandantId)
    .single();
  if (!mandant) return { error: 'Bitte wähle einen Mandanten aus.' };
  if (!input.adresse.email && !mandant.email)
    return { error: 'Für den Mandanten ist keine E-Mail-Adresse hinterlegt.' };

  const { netto, brutto } = summen(positionen, input.steuersatz);

  // 1. Lokal als Entwurf anlegen – so geht kein Stripe-Abo ohne lokale Kopie verloren
  const { data: lokal, error: insertError } = await supabase
    .from('abo')
    .insert({
      created_by: adminId,
      mandant: mandant.id,
      bezeichnung: input.bezeichnung.trim(),
      intervall: input.intervall,
      positionen,
      betrag_netto: netto,
      steuersatz: input.steuersatz,
      betrag_brutto: brutto,
      zahlungsziel_tage: input.zahlungszielTage,
      status: 'entwurf',
    })
    .select('id')
    .single();

  if (insertError || !lokal) {
    console.error('Abo konnte nicht lokal angelegt werden:', insertError);
    return { error: 'Das Abo konnte nicht gespeichert werden.' };
  }

  try {
    const customerId = await stripeKundeSicherstellen(supabase, mandant, input.adresse);
    const taxRate = await steuersatzId(Math.round(input.steuersatz * 100));
    const items = await aboPosten(positionen, input.intervall, lokal.id, input.idempotencyKey);

    // Stripe erstellt ab sofort zu jedem Intervall eine Rechnung und verschickt sie
    const abo = await stripe().subscriptions.create(
      {
        customer: customerId,
        items,
        collection_method: 'send_invoice',
        days_until_due: input.zahlungszielTage,
        default_tax_rates: [taxRate],
        description: input.bezeichnung.trim(),
        metadata: { advact_abo_id: String(lokal.id), advact_user_id: String(mandant.id) },
      },
      { idempotencyKey: input.idempotencyKey }
    );

    await supabase
      .from('abo')
      .update({
        status: 'aktiv',
        startdatum: datum(abo.start_date),
        naechste_rechnung: datum(abo.items.data[0]?.current_period_end),
        stripe_subscription_id: abo.id,
        stripe_customer_id: customerId,
      })
      .eq('id', lokal.id);

    return { aboId: lokal.id };
  } catch (err) {
    console.error(
      'Stripe-Abo fehlgeschlagen:',
      err instanceof Stripe.errors.StripeError ? err.message : err
    );
    await supabase.from('abo').delete().eq('id', lokal.id).eq('status', 'entwurf');
    return {
      error:
        err instanceof Stripe.errors.StripeError
          ? err.message
          : 'Das Abo konnte nicht angelegt werden.',
    };
  }
}

// ---------- Bearbeiten ----------

/**
 * Ändert Bezeichnung, Posten, Zahlungsziel und Empfängeradresse.
 * Gilt ab der nächsten Rechnung, die laufende Periode wird nicht anteilig neu berechnet.
 * Das Intervall bleibt unverändert (ein Wechsel würde sofort eine neue Rechnung auslösen).
 */
export async function adminUpdateAbo(
  aboId: number,
  input: AboUpdateInput
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await adminPruefen(supabase))) return { error: 'Keine Berechtigung.' };

  const positionen = gueltigePosten(input.positionen);
  if (!input.bezeichnung.trim()) return { error: 'Bitte gib dem Abo eine Bezeichnung.' };
  if (!positionen.length) return { error: 'Das Abo braucht mindestens einen Posten mit Betrag.' };

  const { data: lokal } = await supabase.from('abo').select('*').eq('id', aboId).single();
  if (!lokal?.stripe_subscription_id) return { error: 'Abo nicht gefunden.' };
  if (lokal.status === 'beendet')
    return { error: 'Ein beendetes Abo kann nicht mehr geändert werden.' };

  const { data: mandant } = await supabase
    .from('user')
    .select('*')
    .eq('id', lokal.mandant)
    .single();
  if (!mandant) return { error: 'Mandant nicht gefunden.' };

  try {
    await stripeKundeSicherstellen(supabase, mandant, input.adresse);

    // Posten nur ersetzen, wenn sie sich geändert haben
    const postenGeaendert =
      JSON.stringify(positionen.map((p) => [p.beschreibung.trim(), p.menge, p.einzelpreis])) !==
      JSON.stringify(
        (lokal.positionen as TempPosten[]).map((p) => [
          p.beschreibung.trim(),
          p.menge,
          p.einzelpreis,
        ])
      );

    let items: Stripe.SubscriptionUpdateParams.Item[] | undefined;
    if (postenGeaendert) {
      const aktuell = await stripe().subscriptions.retrieve(lokal.stripe_subscription_id);
      const neu = await aboPosten(positionen, lokal.intervall, aboId, input.idempotencyKey);
      items = [...aktuell.items.data.map((i) => ({ id: i.id, deleted: true })), ...neu];
    }

    const taxRate = await steuersatzId(Math.round(input.steuersatz * 100));
    const abo = await stripe().subscriptions.update(
      lokal.stripe_subscription_id,
      {
        ...(items ? { items } : {}),
        proration_behavior: 'none',
        days_until_due: input.zahlungszielTage,
        default_tax_rates: [taxRate],
        description: input.bezeichnung.trim(),
      },
      { idempotencyKey: `${input.idempotencyKey}-update` }
    );

    const { netto, brutto } = summen(positionen, input.steuersatz);
    await supabase
      .from('abo')
      .update({
        bezeichnung: input.bezeichnung.trim(),
        positionen,
        betrag_netto: netto,
        steuersatz: input.steuersatz,
        betrag_brutto: brutto,
        zahlungsziel_tage: input.zahlungszielTage,
        naechste_rechnung:
          lokal.status === 'aktiv' ? datum(abo.items.data[0]?.current_period_end) : null,
      })
      .eq('id', aboId);

    return {};
  } catch (err) {
    console.error(
      'Abo-Änderung fehlgeschlagen:',
      err instanceof Stripe.errors.StripeError ? err.message : err
    );
    return {
      error:
        err instanceof Stripe.errors.StripeError
          ? err.message
          : 'Das Abo konnte nicht geändert werden.',
    };
  }
}

// ---------- Kündigen / Fortsetzen ----------

/** @param sofort true = sofort beenden, false = zum Ende der laufenden Periode */
export async function adminCancelAbo(aboId: number, sofort = false): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await adminPruefen(supabase))) return { error: 'Keine Berechtigung.' };

  const { data: lokal } = await supabase
    .from('abo')
    .select('id, stripe_subscription_id')
    .eq('id', aboId)
    .single();
  if (!lokal?.stripe_subscription_id) return { error: 'Abo nicht gefunden.' };

  try {
    if (sofort) {
      await stripe().subscriptions.cancel(lokal.stripe_subscription_id);
      await supabase
        .from('abo')
        .update({
          status: 'beendet',
          gekuendigt_zum: new Date().toISOString().slice(0, 10),
          naechste_rechnung: null,
        })
        .eq('id', aboId);
    } else {
      const abo = await stripe().subscriptions.update(lokal.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      await supabase
        .from('abo')
        .update({
          status: 'gekuendigt',
          gekuendigt_zum: datum(abo.items.data[0]?.current_period_end),
          naechste_rechnung: null,
        })
        .eq('id', aboId);
    }
    return {};
  } catch (err) {
    console.error(
      'Kündigung fehlgeschlagen:',
      err instanceof Stripe.errors.StripeError ? err.message : err
    );
    return { error: 'Das Abo konnte nicht gekündigt werden.' };
  }
}

/** Kündigung zum Periodenende zurücknehmen. */
export async function adminResumeAbo(aboId: number): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!(await adminPruefen(supabase))) return { error: 'Keine Berechtigung.' };

  const { data: lokal } = await supabase
    .from('abo')
    .select('id, status, stripe_subscription_id')
    .eq('id', aboId)
    .single();
  if (!lokal?.stripe_subscription_id || lokal.status !== 'gekuendigt')
    return { error: 'Dieses Abo kann nicht fortgesetzt werden.' };

  try {
    const abo = await stripe().subscriptions.update(lokal.stripe_subscription_id, {
      cancel_at_period_end: false,
    });
    await supabase
      .from('abo')
      .update({
        status: 'aktiv',
        gekuendigt_zum: null,
        naechste_rechnung: datum(abo.items.data[0]?.current_period_end),
      })
      .eq('id', aboId);
    return {};
  } catch (err) {
    console.error(
      'Fortsetzen fehlgeschlagen:',
      err instanceof Stripe.errors.StripeError ? err.message : err
    );
    return { error: 'Das Abo konnte nicht fortgesetzt werden.' };
  }
}

// ---------- Lesen ----------

export async function fetchAbos(mandantId?: number): Promise<Abonnement[]> {
  const supabase = await createClient();
  let query = supabase
    .from('abo')
    .select('*')
    .neq('status', 'entwurf')
    .order('created_at', { ascending: false });
  if (mandantId) query = query.eq('mandant', mandantId);

  const { data, error } = await query;
  if (error) {
    console.error('Abos konnten nicht geladen werden:', error);
    return [];
  }
  return (data ?? []) as Abonnement[];
}

export async function fetchAboById(id: number): Promise<Abonnement | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('abo').select('*').eq('id', id).maybeSingle();
  return (data as Abonnement) ?? null;
}

/** Rechnungen eines Abos (werden per Webhook angelegt). */
export async function fetchAboRechnungen(aboId: number): Promise<AboRechnung[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('rechnung')
    .select('id, abo, rechnungsnummer, rechnungsdatum, betrag_gesamt, status, stripe_url')
    .eq('abo', aboId)
    .order('rechnungsdatum', { ascending: false });

  if (error) {
    console.error('Abo-Rechnungen konnten nicht geladen werden:', error);
    return [];
  }
  return (data ?? []) as AboRechnung[];
}
