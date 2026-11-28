import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/utils/supabase/admin';
import { stripe } from '@/app/utils/stripe/helpers';
import { sendHtmlEmail, templateZahlungserinnerung } from '@/app/utils/mail';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const ABSTAND_TAGE = 7; // frühestens alle 7 Tage erinnern
const MAX_ERINNERUNGEN = 3;

// Heutiges Datum in deutscher Zeit als 'YYYY-MM-DD'
const heuteBerlin = () =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Berlin' }).format(new Date());
const datumDE = (iso: string) => iso.slice(0, 10).split('-').reverse().join('.');
const euro = (n: number) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);

export async function GET(req: Request) {
  // Vercel schickt automatisch "Authorization: Bearer <CRON_SECRET>"
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const heute = heuteBerlin();
  const grenze = new Date(Date.now() - ABSTAND_TAGE * 24 * 60 * 60 * 1000).toISOString();

  const { data: rechnungen, error } = await supabaseAdmin
    .from('rechnung')
    .select(
      'id, rechnungsnummer, betrag_gesamt, bezahlziel, mandant, stripe_invoice_id, erinnerung_anzahl, erinnerung_zuletzt'
    )
    .in('status', ['offen', 'ueberfaellig'])
    .lt('bezahlziel', heute)
    .not('stripe_invoice_id', 'is', null)
    .lt('erinnerung_anzahl', MAX_ERINNERUNGEN)
    .or(`erinnerung_zuletzt.is.null,erinnerung_zuletzt.lt.${grenze}`)
    .limit(100);

  if (error) {
    console.error('Überfällige Rechnungen konnten nicht geladen werden:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const ergebnis = { gefunden: rechnungen?.length ?? 0, gesendet: 0, bezahlt: 0, fehler: 0 };

  for (const r of rechnungen ?? []) {
    try {
      // Aktuellen Stand bei Stripe prüfen (es gibt noch keinen Webhook)
      const inv = await stripe().invoices.retrieve(r.stripe_invoice_id);

      if (inv.status === 'paid') {
        await supabaseAdmin.from('rechnung').update({ status: 'bezahlt' }).eq('id', r.id);
        ergebnis.bezahlt++;
        continue;
      }
      if (inv.status === 'void' || inv.status === 'uncollectible' || !inv.hosted_invoice_url)
        continue;

      const { data: kunde } = await supabaseAdmin
        .from('user')
        .select('vorname, email')
        .eq('id', r.mandant)
        .maybeSingle();
      if (!kunde?.email) continue;

      const anzahl = (r.erinnerung_anzahl ?? 0) + 1;

      await sendHtmlEmail(
        kunde.email,
        `Zahlungserinnerung: Rechnung ${r.rechnungsnummer}`,
        templateZahlungserinnerung(
          kunde.vorname ?? '',
          r.rechnungsnummer ?? '',
          euro(Number(r.betrag_gesamt) || 0),
          datumDE(r.bezahlziel),
          inv.hosted_invoice_url,
          anzahl
        )
      );

      await supabaseAdmin
        .from('rechnung')
        .update({
          status: 'ueberfaellig',
          erinnerung_anzahl: anzahl,
          erinnerung_zuletzt: new Date().toISOString(),
        })
        .eq('id', r.id);

      ergebnis.gesendet++;
    } catch (err) {
      console.error(`Erinnerung für Rechnung ${r.id} fehlgeschlagen:`, err);
      ergebnis.fehler++;
    }
  }

  return NextResponse.json(ergebnis);
}
