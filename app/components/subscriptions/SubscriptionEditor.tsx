import { createStripeCustomer, subscriptionsGetForUser } from '@/app/actions/subscription';
import { Invoice, Subscription, SubscriptionItem, User } from '@/app/types/Database';
import { useEffect, useRef, useState } from 'react';
import { NumberInputLabel, SelectLabel, TextInputLabel } from '../forms/FormElements';
import Column from '../layout/Column';
import { Column as TableColumn } from 'primereact/column';
import { Button } from 'primereact/button';
import Row from '../layout/Row';
import DividerBlock from '../DividerBlock';
import { DataTable } from 'primereact/datatable';
import { formatCurrency, formatDate, formatDateMonthYear, formatMonth } from '@/app/utils/formats';
import { invoice_status } from '@/app/constants/Constants';
import Tag from '../ui/Tag';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { subscriptionsLoad } from '@/app/actions/subscriptions/subscriptions';
import {
  invoiceCreate,
  invoiceLoadLatest,
  invoicesLoadAll,
  invoiceUpdate,
} from '@/app/actions/invoice';
import { DatePicker } from '../forms/datepicker/DatePicker';
import { invoiceItemCreate } from '@/app/actions/invoiceitem';
import { createStripePaymentLink } from '@/app/actions/stripe/payments';
import { sendInvoiceEmail } from '@/app/actions/email';
import { createStripeSubscription } from '@/app/actions/stripe/subscriptions';
interface Props {
  user: User;
}

export default function SubscriptionEditor({ user }: Props) {
  const toast = useRef<Toast | null>(null);
  const [visible, setVisible] = useState(false);
  const [sending, setSending] = useState(false);

  // DATA
  const [plans, setPlans] = useState<Subscription[]>([]);
  const [subscriptions, setSubscriptions] = useState<Invoice[]>([]);

  // INPUTS
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [selectedSubscription, setSelectedSubscription] = useState('');
  const [subEnd, setSubEnd] = useState<Date | undefined>(undefined);
  const [subName, setSubName] = useState('');
  const [subPrice, setSubPrice] = useState(0);
  const [subStart, setSubStart] = useState<Date | null>(null);

  const fetchData = async () => {
    const [res, subRes, invoiceRes] = await Promise.all([
      subscriptionsGetForUser(user.id),
      subscriptionsLoad(),
      invoiceLoadLatest(),
    ]);
    setPlans(subRes);
    setSubscriptions(res);
    const invoice = invoiceRes[0];
    const next = Number(invoice.invoice_number) + 1;
    setInvoiceNumber(String(next));
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  // CHECKS
  const hasSub = subscriptions.length >= 1;

  // TEMPLATES
  const monthTemplate = (rowData: Invoice) => {
    const raw = rowData.invoice_date && formatDateMonthYear(rowData?.invoice_date);
    const formatted = raw ? raw : '';
    return <span>{formatted}</span>;
  };

  const priceTemplate = (rowData: Invoice) => (
    <span>{formatCurrency(rowData.invoice_total_gross)}</span>
  );

  const statusTemplate = (rowData: Invoice) => {
    const status = invoice_status.find((i) => i.value === rowData.invoice_status);
    return (
      <Tag
        bgColor={status?.bg || 'grey'}
        color={status?.color || 'black'}
        text={status?.label || ''}
      />
    );
  };

  // NEU: Rechnung intern anlegen + Stripe nur für den Payment Link nutzen
  const startSubscription = async () => {
    if (!selectedSubscription || !subStart) return;
    const plan = plans.find((p) => p.id === selectedSubscription);
    if (!plan) return;
    setSending(true);

    try {
      // 1. Interne Rechnung anlegen (für Historie und PDF)
      const res = await invoiceCreate({
        user: String(user.id),
        invoice_number: invoiceNumber,
        invoice_date: subStart,
        invoice_date_due: new Date(subStart.getTime() + 14 * 24 * 60 * 60 * 1000),
        invoice_recipient_email: user.email,
        invoice_total_gross: plan.amount_total,
        invoice_total_net: plan.amount_net,
        tax_amount: plan.amount_tax,
        subscription: true,
        invoice_status: 'sent',
      });

      const item = await invoiceItemCreate({
        invoice: res.id,
        index: 1,
        description: `${plan.name} ${formatMonth(subStart)}`,
        quantity: 1,
        price_single: plan.amount_total,
        price_total: plan.amount_total,
        taxes_amount: plan.amount_tax,
      });

      // 2. Echtes Stripe-Abo über Checkout (Kunde hinterlegt Zahlungsmethode)
      const { paymentUrl } = await createStripeSubscription({
        user,
        planName: plan.name,
        amountGross: plan.amount_total,
        startDate: subStart,
        invoiceId: res.id,
      });
      if (!paymentUrl) throw new Error('Zahlungslink konnte nicht erstellt werden');

      // 3. Fester Link statt kurzlebiger Session-URL
      const stableUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/rechnung/bezahlen/${res.id}`;

      // 4. E-Mail mit PDF und Link
      await sendInvoiceEmail(res, [item], user, stableUrl);
      await invoiceUpdate({ invoice_status: 'sent', payment_url: stableUrl }, res.id);

      await fetchData();
      toast.current?.show({
        severity: 'success',
        summary: 'Abo erstellt',
        detail: 'Der Kunde erhält eine E-Mail mit dem Zahlungslink.',
      });
      setVisible(false);
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Das Abo konnte nicht erstellt werden.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Column>
      <Toast ref={toast} />
      <Dialog
        draggable={false}
        header="Abo bearbeiten"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 480 }}
        visible={visible}
      >
        <Column>
          <SelectLabel
            label="Abo auswählen"
            onChange={setSelectedSubscription}
            optionLabel="displayLabel"
            optionValue="id"
            options={plans.map((p) => ({
              ...p,
              displayLabel: `${p.name} (${formatCurrency(p.amount_total)}/Monat)`,
            }))}
            value={selectedSubscription}
          />
          {!hasSub && <DatePicker label="Startdatum" onChange={setSubStart} value={subStart} />}
          <TextInputLabel label="Rechnungsnummer" value={String(invoiceNumber)} readonly />
          <Column gap={4}>
            <Button
              disabled={!selectedSubscription || !subStart || sending}
              label={sending ? 'Wird erstellt…' : hasSub ? 'Aktualisieren' : 'Abo starten'}
              onClick={startSubscription}
            />
            {hasSub && (
              <span className="text-s">
                Das Abo wird ab dem {formatDate(newDate || '')} zu einem Preis von{' '}
                {formatCurrency(subPrice)} fortgesetzt.
              </span>
            )}
          </Column>
        </Column>
      </Dialog>
      <Row justifyContent="space-between">
        <h3>Abonnement</h3>
        <Button
          label={hasSub ? 'Abo bearbeiten' : 'Abo anlegen'}
          onClick={() => setVisible(true)}
        />
      </Row>
      <DividerBlock height={0.5} />
      <h4>Zahlungshistorie</h4>
      <DataTable value={subscriptions}>
        <TableColumn body={monthTemplate} header="Monat" />
        <TableColumn body={statusTemplate} header="Status" />
        <TableColumn body={priceTemplate} header="Preis" />
      </DataTable>
    </Column>
  );
}
