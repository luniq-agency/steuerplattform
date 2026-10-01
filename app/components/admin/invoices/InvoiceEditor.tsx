'use client';

import { Invoice, InvoiceItem, User } from '@/app/types/Database';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { PDFViewer } from '@react-pdf/renderer';
import { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import {
  invoiceItemCreate,
  invoiceItemDelete,
  invoiceItemsLoad,
  invoiceItemUpdate,
} from '@/app/actions/invoiceitem';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { invoiceUpdate } from '@/app/actions/invoice';
import { OverlayPanel } from 'primereact/overlaypanel';
import { tax_rates } from '@/app/constants/Constants';
import DividerBlock from '../../DividerBlock';
import { formatCurrency } from '@/app/utils/formats';
import { Calendar } from 'primereact/calendar';
import { SkeletonLoaderLabel } from '../../forms/FormElements';
import { Dialog } from 'primereact/dialog';
import { Skeleton } from 'primereact/skeleton';
import { InvoicePDF } from '../../pdf/InvoicePDF';
import { useAuth } from '@/app/context/AuthContext';
import LayoutColumn from '../../layout/Column';
import Row from '../../layout/Row';
import { toLocalTime } from '@/app/actions/dates/dates';
import { Toast } from 'primereact/toast';

interface Props {
  clients: User[];
  invoice: Invoice;
  onSubmit?: () => void;
}

export default function InvoiceEditor({ clients, invoice, onSubmit }: Props) {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [previewing, setPreviewing] = useState(false);
  const toast = useRef<Toast | null>(null);
  const [updating, setUpdating] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([]);

  const op = useRef<OverlayPanel | null>(null);

  const [adding, setAdding] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(null);
  const [invoiceDueDate, setInvoiceDueDate] = useState<Date | null>(null);
  const [invoiceRecipient, setInvoiceRecipient] = useState('');
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(0);
  const [invoiceTotal, setInvoiceTotal] = useState(0);
  const [invoiceTotalNet, setInvoiceTotalNet] = useState(0);
  const [taxCategory, setTaxCategory] = useState('');
  const [taxRate, setTaxRate] = useState(0);

  useEffect(() => {
    if (!taxCategory) return;
    const adding = taxCategory === 'net'; // Steuer wird aufgeschlagen
    setAdding(adding);
    setTaxRate(0.19);
  }, [taxCategory]);

  const grossTotal = items.reduce((sum, item) => sum + item.price_total, 0);
  const netTotal = adding ? grossTotal : grossTotal / (1 + taxRate); // brutto → netto
  const taxAmount = adding ? grossTotal * taxRate : grossTotal - netTotal;
  const total = adding ? grossTotal + taxAmount : grossTotal;

  useEffect(() => {
    if (!invoice) return;

    if (invoice) {
      setInvoiceNumber(invoice.invoice_number);
      setInvoiceDate(invoice.invoice_date ? new Date(invoice.invoice_date) : null);
      setInvoiceDueDate(invoice.invoice_date_due ? new Date(invoice.invoice_date_due) : null);
      setInvoiceRecipient(invoice.user ?? '');
      setInvoiceTotal(invoice.invoice_total_gross);
      setInvoiceTotalNet(invoice.invoice_total_net);
      setTaxCategory(invoice.tax_category);
      setTaxRate(invoice.tax_rate);
    }

    const fetchItems = async () => {
      try {
        const res = await invoiceItemsLoad(invoice.id);
        setItems(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
    setLoading(false);
  }, [invoice]);

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
      /*updateItems();*/
    }
  };

  // TEMPLATES
  const clientTemplate = (client: User) => (
    <span>
      {client.user_name_last}, {client.user_name_first}
    </span>
  );

  const deleteItem = async (id: string) => {
    try {
      await invoiceItemDelete(id);
    } catch (err) {
      console.error(err);
    }
    updateItems();
  };

  const deleteTemplate = (rowData: InvoiceItem) => (
    <Button
      className="button-square"
      icon="pi pi-trash"
      style={{ color: 'red' }}
      text
      onClick={() => deleteItem(rowData.id)}
    />
  );

  const descriptionEditTemplate = (rowData: InvoiceItem) => (
    <InputText
      onChange={(e) => updateItem(rowData.id, 'description', e.target.value)}
      value={rowData.description || ''}
    />
  );

  const quantityEditTemplate = (rowData: InvoiceItem) => (
    <InputNumber
      onChange={(e) => updateItem(rowData.id, 'quantity', e.value || 0)}
      value={rowData.quantity || 0}
    />
  );

  const priceTotalTemplate = (rowData: InvoiceItem) => (
    <span>{formatCurrency(rowData.price_total)}</span>
  );

  const priceSingleEditTemplate = (rowData: InvoiceItem) => (
    <InputNumber
      currency="EUR"
      locale="de-DE"
      mode="currency"
      onChange={(e) => updateItem(rowData.id, 'price_single', e.value || 0)}
      value={rowData.price_single || 0}
    />
  );

  // ACTIONS
  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        updated.price_total = updated.quantity * updated.price_single;
        return updated;
      })
    );
  };

  const updateItems = async () => {
    const res = await invoiceItemsLoad(invoice.id);
    setItems(res);
  };

  const updateInvoice = async () => {
    setUpdating(true);
    const invoicePayload = {
      invoice_date: invoiceDate ? (toLocalTime(invoiceDate) as any) : null,
      invoice_date_due: invoiceDueDate ? (toLocalTime(invoiceDueDate) as any) : null,
      invoice_number: invoiceNumber,
      invoice_total_gross: Number(total.toFixed(2)),
      invoice_total_net: Number(netTotal.toFixed(2)),
      tax_amount: Number(taxAmount.toFixed(2)),
      tax_category: taxCategory,
      tax_rate: taxRate,
      user: invoiceRecipient,
    };
    try {
      await invoiceUpdate(invoicePayload, invoice.id);
      await Promise.all(
        items.map((item) =>
          invoiceItemUpdate(
            {
              description: item.description,
              quantity: item.quantity,
              price_single: item.price_single,
              price_total: item.price_total,
              taxes_amount: item.price_total * taxRate,
            },
            item.id
          )
        )
      );
      setInvoiceTaxAmount(taxAmount);
      setInvoiceTotal(grossTotal);
      setInvoiceTotalNet(netTotal);
      toast.current?.show({
        severity: 'success',
        summary: 'Änderungen gespeichert',
        detail: 'Die Rechnung wurden erfolgreich gespeichert.',
      });
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler',
        detail: 'Die Rechnung konnte nicht gespeichert werden. Bitte probieren Sie es erneut.',
      });
    } finally {
      setUpdating(false);
      if (onSubmit) onSubmit();
    }
  };

  const clientOptions = clients
    .map((c) => ({
      ...c,
      fullName: `${c.user_name_last}, ${c.user_name_first}`,
    }))
    .sort((a, b) => a.user_name_last.localeCompare(b.user_name_last));

  if (loading)
    return (
      <div className="column gap-m">
        <div className="grid columns-two gap-m mobile-column">
          <SkeletonLoaderLabel height="38.1px" label="Rechnugsnummer" />
          <SkeletonLoaderLabel height="38.1px" label="Empfänger" />
          <SkeletonLoaderLabel height="38.1px" label="Steuersatz" />
          <SkeletonLoaderLabel height="38.1px" label="Rechnungsdatum" />
        </div>
        <DividerBlock height={0.5} />
        <div className="column">
          <div className="row space-between">
            <h5>Zwischensumme</h5>
            <Skeleton height="16px" width="120px" />
          </div>
          <div className="row space-between">
            <h5>Steuern ({taxRate * 100}%)</h5>
            <Skeleton height="16px" width="120px" />
          </div>
          <div className="row space-between">
            <h4>Gesamtbetrag</h4>
            <Skeleton height="24px" width="120px" />
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
      </div>
    );

  return (
    <div className="column gap-m">
      <Toast ref={toast} />
      <Dialog
        contentClassName="previewer"
        draggable={false}
        header="Vorschau"
        onHide={() => setPreviewing(false)}
        style={{ maxHeight: '80vh', maxWidth: 850, width: '100%' }}
        visible={previewing}
      >
        {invoice.user && (
          <PDFViewer style={{ width: '100%', height: '70vh', border: 'none' }}>
            <InvoicePDF
              invoice={invoice}
              items={items}
              recipient={clients.find((t) => t.id === invoice.user) || clients[0]}
            />
          </PDFViewer>
        )}
      </Dialog>
      <div className="grid columns-two gap-m mobile-column">
        <div className="column gap-xs">
          <label>Rechnungsnummer</label>
          <InputText onChange={(e) => setInvoiceNumber(e.target.value)} value={invoiceNumber} />
        </div>
        <div className="column gap-xs">
          <label>Empfänger</label>
          <Dropdown
            filter
            filterPlaceholder="Kunde suchen..."
            itemTemplate={clientTemplate}
            onChange={(e) => setInvoiceRecipient(e.value)}
            optionLabel="fullName"
            optionValue="id"
            options={clientOptions}
            value={invoiceRecipient}
            valueTemplate={
              invoiceRecipient
                ? clientTemplate(clients.find((c) => c.id === invoiceRecipient)!)
                : 'Empfänger auswählen'
            }
          />
        </div>
        <div className="column gap-xs">
          <label>Steuersatz</label>
          <Dropdown
            onChange={(e) => setTaxCategory(e.value)}
            optionValue="value"
            options={tax_rates}
            value={taxCategory}
          />
        </div>
        <Row>
          <LayoutColumn gap={4}>
            <label>Rechnungsdatum</label>
            <Calendar onChange={(e) => setInvoiceDate(e.value || null)} value={invoiceDate} />
          </LayoutColumn>
          <LayoutColumn gap={4}>
            <label>Fälligkeitsdatum</label>
            <Calendar
              minDate={invoiceDate || new Date()}
              onChange={(e) => setInvoiceDueDate(e.value || null)}
              value={invoiceDueDate}
            />
          </LayoutColumn>
        </Row>
      </div>
      <DividerBlock height={0.5} />
      <div className="column">
        <div className="row space-between">
          <h5>Zwischensumme</h5>
          <h5>{formatCurrency(netTotal)}</h5>
        </div>
        <div className="row space-between">
          <h5>Steuern ({taxRate * 100}%)</h5>
          <h5>{formatCurrency(taxAmount)}</h5>
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
      <DataTable emptyMessage="Keine Posten gefunden" sortField="index" sortOrder={1} value={items}>
        <Column field="index" header="#" />
        <Column body={descriptionEditTemplate} header="Beschreibung" />
        <Column body={quantityEditTemplate} header="Menge" />
        <Column body={priceSingleEditTemplate} header="Einzelpreis" />
        <Column body={priceTotalTemplate} header="Gesamtpreis" />
        <Column body={deleteTemplate} header="Aktionen" />
      </DataTable>
      <div className="row gap-s">
        <Button
          className="button-primary"
          disabled={updating || !invoiceNumber || !taxRate || !invoiceRecipient}
          icon={updating ? 'pi pi-spinner' : undefined}
          label="Änderungen speichern"
          onClick={updateInvoice}
          style={{ width: 'fit-content' }}
        />
        <Button
          className="button-primary"
          label="Vorschau"
          onClick={() => setPreviewing(true)}
          style={{ width: 'fit-content' }}
        />
      </div>
    </div>
  );
}
