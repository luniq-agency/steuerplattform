'use client';

import { BreadCrumb } from 'primereact/breadcrumb';
import DividerBlock from '@/app/components/DividerBlock';
import { clientsLoadAdmin } from '@/app/actions/clients';
import { PrimaryButton, TertiaryButton } from '@/app/components/buttons/Buttons';
import Row from '@/app/components/layout/Row';
import { Eye, Mail, Save } from 'lucide-react';
import Grid from '@/app/components/layout/Grid';
import { useEffect, useRef, useState } from 'react';
import { Invoice, InvoiceItem, User } from '@/app/types/Database';
import { TextInputLabel } from '@/app/components/forms/FormElements';
import { tax_rates } from '@/app/constants/Constants';
import { SelectLabel, UserSelectLabel } from '@/app/components/inputs/Select';
import { DatePicker } from '@/app/components/forms/datepicker/DatePicker';
import InvoicePositionTable from '@/app/components/invoices/InvoicePositionTable';
import { invoiceItemCreate, invoiceItemsLoad, invoiceItemUpdate } from '@/app/actions/invoiceitem';
import { Button } from 'primereact/button';
import { formatCurrency } from '@/app/utils/formats';
import { sendInvoiceEmail } from '@/app/actions/email';
import { createStripeInvoice } from '@/app/actions/invoices/stripeInvoices';
import { taxRates } from '@/app/constants/taxes';
import { TaxRate } from '@/app/types/internal';
import { Toast } from 'primereact/toast';
import { invoiceUpdate } from '@/app/actions/invoice';
import { userLookup } from '@/app/actions/users';
import { createStripePaymentLink } from '@/app/actions/stripe/payments';
import { Dialog } from 'primereact/dialog';
import InvoicePDFPreview from '@/app/components/invoices/InvoicePreview';

const subOptions = [
  {
    label: 'Einmal-Rechnung',
    value: 'false',
  },
  {
    label: 'Abo',
    value: 'true',
  },
];

interface Props {
  invoice: Invoice;
}

export default function RechnungPage({ invoice }: Props) {
  const loadedInvoiceId = useRef<string | null>(null);
  const toast = useRef<Toast | null>(null);

  // NAV & BREADCRUMBS
  const navItems = [
    {
      label: 'Rechungen',
      url: '/admin/rechnungen',
    },
    {
      label: `Rechnung ${invoice.invoice_number}`,
    },
  ];

  const home = { icon: 'pi pi-home', url: '/admin' };

  // INIT
  useEffect(() => {
    if (!invoice || loadedInvoiceId.current === invoice.id) return;
    loadedInvoiceId.current = invoice.id;

    const fetchData = async () => {
      const [clientRes, itemsRes, taxRes, userRes] = await Promise.all([
        clientsLoadAdmin(),
        invoiceItemsLoad(invoice.id),
        taxRates.find((t) => t.value === invoice.tax_category),
        userLookup(invoice.user),
      ]);
      setClients(clientRes);
      setItems(itemsRes);
      taxRes && setTaxRate(taxRes);
      const matched = clientRes.find((c) => c.id === userRes?.id) ?? userRes;
      setRecipient(matched);
      setTaxMulitplier(taxRes ? taxRes?.multiplier : 0.19);
      setAdding(taxRes ? taxRes.adding : false);
    };
    fetchData();
  }, [invoice?.id]);

  // INPUTS
  const [invoiceDate, setInvoiceDate] = useState(invoice.invoice_date || '');
  const [invoiceDateDue, setInvoiceDateDue] = useState(invoice.invoice_date_due || '');
  const [recipient, setRecipient] = useState<User | null>(null);
  const [rechnungsnummer, setRechnungsnummer] = useState(invoice.invoice_number || '');
  const [subscription, setSubscription] = useState('false');
  const [taxAmount, setTaxAmount] = useState(invoice.tax_amount || 0);
  const [taxMultiplier, setTaxMulitplier] = useState(invoice.tax_rate || 0);
  const [taxRate, setTaxRate] = useState<TaxRate | null>(taxRates[0] || null);

  // DATA
  const [adding, setAdding] = useState(false);
  const [clients, setClients] = useState<User[]>([]);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // CALC
  const baseAmount = items.reduce((sum, i) => sum + (i.price_total || 0), 0);
  const net = adding ? baseAmount : baseAmount / (1 + taxMultiplier);
  const tax = adding ? baseAmount * taxMultiplier : baseAmount - net;
  const total = adding ? baseAmount + tax : baseAmount;

  // STATES
  const [inspecting, setInspecting] = useState(false);
  const [sending, setSending] = useState(false);

  // ACTIONS
  const addItem = async () => {
    const payload = {
      index: items.length + 1,
      invoice: invoice.id,
      quantity: 0,
      price_single: 0,
      price_total: 0,
    };

    try {
      const res = await invoiceItemCreate(payload);
      setItems((prev) => [...prev, res]);
    } catch (err) {
      console.error(err);
    } finally {
    }
  };

  const changeTaxes = (value: string) => {
    const rate = taxRates.find((t) => t.value === value);
    if (!rate) return;
    setAdding(rate.adding);
    setTaxRate(rate);
    setTaxMulitplier(rate.multiplier);
  };

  const saveInvoice = async () => {
    const date = new Date(invoiceDate);
    const due = new Date(invoiceDateDue);

    const payload = {
      invoice_date: date,
      invoice_date_due: due,
      invoice_recipient_email: recipient?.email,
      invoice_total_gross: Number(total.toFixed(2)), // ← nutzt jetzt die aktuellen Werte von oben
      invoice_total_net: Number(net.toFixed(2)),
      subscription: subscription === 'true',
      tax_amount: Number(tax.toFixed(2)),
      tax_category: taxRate?.value,
      tax_rate: taxRate?.multiplier,
      user: recipient?.id,
    };

    await invoiceUpdate(payload, invoice.id);

    await Promise.all(
      items.map((i) =>
        invoiceItemUpdate(
          {
            description: i.description,
            index: i.index,
            price_single: i.price_single,
            price_total: i.price_total,
            quantity: i.quantity,
            taxes_amount: i.taxes_amount,
          },
          i.id
        )
      )
    );

    toast.current?.show({
      severity: 'success',
      summary: 'Rechnung gespeichert',
      detail: 'Die Rechnung wurde gespeichert.',
    });
  };

  const sendInvoice = async () => {
    setSending(true);
    if (!recipient) return;

    const payload = {
      invoice_date_sent: new Date(),
      invoice_status: 'sent',
      invoice_total_gross: total,
      invoice_total_net: net,
      subscription: subscription === 'true',
      tax_amount: tax,
      tax_rate: taxMultiplier,
    };

    const res = await invoiceUpdate(payload, invoice.id);
    const payment = `https://app.conek.de/rechnung/${invoice.id}`

    try {
      await sendInvoiceEmail(res, items, recipient, payment);
      await invoiceUpdate({ payment_url: payment }, invoice.id);
    } catch (err) {
    } finally {
      setSending(false);
    }
    setSending(false);
  };

  const isComplete = recipient?.email && items.length >= 1;

  return (
    <div className="page-content column">
      <Dialog
        onHide={() => setInspecting(false)}
        style={{ height: '90vh', maxWidth: '90vw' }}
        visible={inspecting}
      >
        {recipient && (
          <InvoicePDFPreview
            gross={baseAmount}
            invoice={invoice}
            items={items}
            recipient={recipient}
            net={net}
            tax={tax}
            total={total}
            taxMultiplier={taxMultiplier}
          />
        )}
      </Dialog>
      <Toast ref={toast} />
      <BreadCrumb home={home} model={navItems} />
      <DividerBlock height={2} />
      <div className="row space-between">
        <div className="row gap-xs align-center">
          <h1>Rechnung</h1>
        </div>
        <Row alignItems="center" gap={8} justifyContent="end">
          <TertiaryButton
            disabled={!recipient}
            icon={Eye}
            label="Vorschau"
            onClick={() => setInspecting(true)}
            size="medium"
          />
          <TertiaryButton
            disabled={sending || !isComplete}
            icon={Mail}
            label="Rechnung versenden"
            onClick={sendInvoice}
            size="medium"
          />
          <PrimaryButton icon={Save} label="Speichern" onClick={saveInvoice} size="medium" />
        </Row>
      </div>
      <DividerBlock height={2} />
      <div className="container grow" style={{ gap: 16 }}>
        <Grid columns={2} gap={16}>
          <TextInputLabel
            label="Rechnugsnummer"
            onChange={setRechnungsnummer}
            value={rechnungsnummer}
          />
          <UserSelectLabel
            label="Empfänger"
            onChange={setRecipient}
            optionLabel="name"
            options={clients}
            value={recipient}
          />
          <SelectLabel
            label="Steuersatz"
            onChange={(value) => changeTaxes(value)}
            optionLabel="label"
            optionValue="value"
            options={tax_rates}
            value={taxRate?.value || ''}
          />
          <Row gap={16}>
            <DatePicker label="Rechnungsdatum" onChange={setInvoiceDate} value={invoiceDate} />
            <DatePicker
              label="Fälligkeitsdatum"
              onChange={setInvoiceDateDue}
              value={invoiceDateDue}
            />
          </Row>
          <SelectLabel
            label="Abonnement"
            onChange={setSubscription}
            optionLabel="label"
            optionValue="value"
            options={subOptions}
            value={subscription}
          />
        </Grid>
        <DividerBlock height={0.5} />
        <div className="column">
          <div className="row space-between">
            <h5>Zwischensumme</h5>
            <h5>{formatCurrency(net)}</h5>
          </div>
          <div className="row space-between">
            <h5>Steuern ({((taxRate?.multiplier ?? 0) * 100).toFixed(0)}%)</h5>
            <h5>{formatCurrency(tax)}</h5>
          </div>
          <div className="row space-between">
            <h4>Gesamtbetrag</h4>
            <h4>{formatCurrency(total)}</h4>
          </div>
        </div>
        <DividerBlock height={0.5} />
        <div className="row space-between">
          <h4>Posten</h4>
          <Button
            className="button-round"
            disabled={!taxRate}
            icon="pi pi-plus"
            onClick={addItem}
            text
          />
        </div>
        <DividerBlock height={0.5} />
        <InvoicePositionTable invoice={invoice} onPositionsChange={setItems} positions={items} />
      </div>
    </div>
  );
}
