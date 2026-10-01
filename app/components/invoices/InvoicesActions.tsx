'use client';

import { Invoice } from '@/app/types/Database';
import { invoiceUpdate } from '@/app/actions/invoice';
import { sendInvoiceEmail } from '@/app/actions/email';
import { userLookup } from '@/app/actions/users';
import { invoiceItemsLoad } from '@/app/actions/invoiceitem';
import { Button } from 'primereact/button';
import { useRouter } from 'next/navigation';
import { OverlayPanel } from 'primereact/overlaypanel';
import { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { createStripeInvoice } from '@/app/actions/invoices/stripeInvoices';

interface Props {
  invoice: Invoice;
}

export default function InvoiceActions({ invoice }: Props) {
  const [sending, setSending] = useState(false);

  const op = useRef<OverlayPanel | null>(null);
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  // ACTIONS
  const markAsPaid = async (e: any) => {
    op.current?.toggle(e);
    try {
      await invoiceUpdate({ invoice_status: 'paid' }, invoice.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Rechnungen aktualisiert',
        detail: 'Die Rechnung wurden als bezahlt markiert.',
      });
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler aufgetreten',
        detail:
          'Die Rechnung konnte nicht als bezahlt markiert werden. Probiere es bitte noch einmal.',
      });
    }
  };

  const sendInvoice = async () => {
    const items = await invoiceItemsLoad(invoice.id);
    const adding = invoice.tax_category === 'net';
    const grossTotalRaw = items.reduce((sum, i) => sum + (i.price_total || 0), 0);
    const netTotal = adding ? grossTotalRaw : grossTotalRaw / (1 + invoice.tax_rate);
    const taxAmount = adding ? grossTotalRaw * invoice.tax_rate : grossTotalRaw - netTotal;
    const total = adding ? grossTotalRaw + taxAmount : grossTotalRaw;
    const payload = {
      invoice_total_gross: total,
      invoice_total_net: netTotal,
      tax_amount: taxAmount,
    };
    console.log('Gross:', grossTotalRaw);
    console.log('Net:', netTotal);
    console.log('Tax:', taxAmount);
    console.log('Total:', total);
    /* const res = await invoiceUpdate()
    setSending(true);
    op.current?.hide();
    try {
      const recipient = await userLookup(invoice.user);
      const items = await invoiceItemsLoad(invoice.id);

      // Stripe Invoice erstellen
      const { stripeInvoiceId, paymentUrl } = await createStripeInvoice(
        invoice,
        items,
        recipient,
        invoice.invoice_number
      );

      if (!paymentUrl) return;

      // Unsere eigene E-Mail mit PDF versenden
      await sendInvoiceEmail(invoice, items, recipient, paymentUrl);

      // Status + Stripe IDs speichern
      await invoiceUpdate(
        {
          invoice_date_sent: new Date(),
          invoice_status: 'sent',
          stripe_invoice_id: stripeInvoiceId,
          payment_url: paymentUrl,
        },
        invoice.id
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Rechnung versendet',
        detail: 'Die Rechnung wurde an den Kunden versendet.',
      });
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Die Rechnung konnte nicht versendet werden.',
      });
    } finally {
      setSending(false);
    }
      */
  };

  return (
    <div>
      <Toast ref={toast} />
      <OverlayPanel ref={op}>
        <div className="column gap-xs">
          <Button
            className="button-context"
            disabled={sending || !invoice.user}
            icon="pi pi-envelope"
            label="Rechnung versenden"
            onClick={sendInvoice}
          />
          <Button
            className="button-context"
            disabled={invoice.invoice_status === 'paid'}
            icon="pi pi-euro"
            label="Als bezahlt markieren"
            onClick={markAsPaid}
          />
          <Button
            className="button-context"
            disabled={invoice.invoice_status === 'paid' || invoice.invoice_status === 'sent'}
            icon="pi pi-trash"
            label="Rechnung löschen"
            style={{ color: 'red' }}
          />
        </div>
      </OverlayPanel>
      <Button label="Aktionen" onClick={(e) => op.current?.toggle(e)} />
    </div>
  );
}
