'use server';

import { createClient } from '@/app/utils/supabase/server';
import type { TempPosten } from '@/app/types/rechnung/Rechnungen';

export type InvoiceInput = {
  betrag_gesamt: number;
  betrag_netto: number;
  betrag_steuern: number;
  bezahlziel: string | null;
  created_by: number;
  kunde: number | null;
  rechnungsdatum: string | null;
  rechnungsnummer: string;
  steuersatz: number;
};

export async function saveInvoice(
  invoice: InvoiceInput,
  positions: TempPosten[],
  invoiceId?: string
): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  // 1. Rechnung anlegen oder aktualisieren
  let id = invoiceId;

  if (id) {
    const { error } = await supabase.from('rechnung').update(invoice).eq('id', id);
    if (error) return { error: error.message };
  } else {
    const { data, error } = await supabase
      .from('rechnung')
      .insert(invoice)
      .select('id')
      .single();
    if (error) return { error: error.message };
    id = data.id;
  }

  // 2. Posten anlegen bzw. aktualisieren
  if (positions.length > 0) {
    const rows = positions.map((p) => ({
      id: p.id,
      rechnung: id,
      index: p.index,
      beschreibung: p.beschreibung,
      menge: p.menge,
      einzelbetrag: p.einzelpreis,
      gesamtbetrag: p.gesamtpreis,
    }));

    const { error } = await supabase
      .from('rechnungsposten')
      .upsert(rows, { onConflict: 'id' });
    if (error) return { id, error: error.message };
  }

  // 3. Entfernte Posten löschen
  let deleteQuery = supabase.from('rechnungsposten').delete().eq('rechnung', id);
  if (positions.length > 0) {
    deleteQuery = deleteQuery.not('id', 'in', `(${positions.map((p) => p.id).join(',')})`);
  }
  const { error: deleteError } = await deleteQuery;
  if (deleteError) return { id, error: deleteError.message };

  return { id };
}