// Gemeinsame Stripe-Hilfsfunktionen für Rechnungen und Abos.
// Bewusst KEINE 'use server'-Datei: Exporte hier sind keine öffentlich aufrufbaren Server Actions.
import 'server-only';
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';

let stripeClient: Stripe | null = null;
export const stripe = () => (stripeClient ??= new Stripe(process.env.STRIPE_SECRET_KEY!));

export const cents = (euro: number) => Math.round(euro * 100);
export const euro = (c: number | null | undefined) => (c ?? 0) / 100;

export type Adresse = {
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  email: string;
};

type MandantFuerStripe = {
  id: number;
  vorname: string | null;
  nachname: string | null;
  email: string | null;
  telefon?: string | null;
  stripe_customer_id: string | null;
};

/** Vorhandenen Stripe-Kunden nutzen oder anlegen; Adresse und E-Mail aktualisieren. */
export async function stripeKundeSicherstellen(
  supabase: SupabaseClient,
  mandant: MandantFuerStripe,
  adresse: Adresse
): Promise<string> {
  const daten = {
    email: adresse.email || mandant.email || undefined,
    name: `${mandant.vorname ?? ''} ${mandant.nachname ?? ''}`.trim(),
    phone: mandant.telefon || undefined,
    address: {
      line1: `${adresse.strasse} ${adresse.hausnummer}`.trim(),
      postal_code: adresse.plz,
      city: adresse.ort,
      country: 'DE',
    },
  };

  if (mandant.stripe_customer_id) {
    await stripe().customers.update(mandant.stripe_customer_id, daten);
    return mandant.stripe_customer_id;
  }

  const customer = await stripe().customers.create({
    ...daten,
    metadata: { advact_user_id: String(mandant.id) },
    preferred_locales: ['de'],
  });
  await supabase.from('user').update({ stripe_customer_id: customer.id }).eq('id', mandant.id);
  return customer.id;
}

/** Steuersatz (z. B. 19) in Stripe finden oder einmalig anlegen. */
export async function steuersatzId(prozent: number, inklusive = false): Promise<string> {
  const vorhanden = await stripe().taxRates.list({ active: true, limit: 100 });
  const treffer = vorhanden.data.find(
    (t) => t.percentage === prozent && t.inclusive === inklusive && t.country === 'DE'
  );
  if (treffer) return treffer.id;

  const neu = await stripe().taxRates.create({
    display_name: 'USt.',
    description: `Umsatzsteuer ${prozent} %${inklusive ? ' (inkl.)' : ''}`,
    percentage: prozent,
    inclusive: inklusive,
    country: 'DE',
    jurisdiction: 'DE',
  });
  return neu.id;
}

/** Prüft, ob der eingeloggte User Admin ist, und gibt seine Profil-ID zurück. */
export async function adminPruefen(supabase: SupabaseClient): Promise<number | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('user').select('id, rolle').eq('user_id', user.id).single();
  return data?.rolle === 'admin' ? (data.id as number) : null;
}
