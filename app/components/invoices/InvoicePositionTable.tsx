import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Invoice, InvoiceItem } from '@/app/types/Database';
import LayoutColumn from '../layout/Column';
import { formatCurrency } from '@/app/utils/formats';
import { invoiceItemDelete, invoiceItemsLoad } from '@/app/actions/invoiceitem';
import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import Row from '../layout/Row';
import style from './Invoices.module.css';

interface Props {
  invoice: Invoice;
  onPositionsChange: (updater: (prev: InvoiceItem[]) => InvoiceItem[]) => void;
  positions: InvoiceItem[];
}

export default function InvoicePositionTable({ invoice, positions, onPositionsChange }: Props) {
  const deleteItem = async (id: string) => {
    try {
      await invoiceItemDelete(id);
    } catch (err) {
      console.error(err);
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    onPositionsChange((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const changed = { ...item, [field]: value };
        changed.price_total = changed.quantity * changed.price_single;
        return changed;
      })
    );
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

  return (
    <DataTable
      emptyMessage="Keine Posten gefunden"
      sortField="index"
      sortOrder={1}
      value={positions}
    >
      <Column field="index" header="#" />
      <Column body={descriptionEditTemplate} header="Beschreibung" />
      <Column body={quantityEditTemplate} header="Menge" />
      <Column body={priceSingleEditTemplate} header="Einzelpreis" />
      <Column body={priceTotalTemplate} header="Gesamtpreis" />
      <Column body={deleteTemplate} header="Aktionen" />
    </DataTable>
  );
}
