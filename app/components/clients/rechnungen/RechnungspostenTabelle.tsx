import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { formatCurrency } from '@/app/utils/formats';
import { Button } from 'primereact/button';
import { Rechnungsposten, TempPosten } from '@/app/types/rechnung/Rechnungen';

interface Props<T extends TempPosten> {
  positions: T[] | Rechnungsposten[];
  onPositionsChange: (updater: (prev: T[]) => T[]) => void;
  onDelete: (item: T) => void;
}

export default function RechnungspostenTabelle<T extends TempPosten>({
  positions,
  onPositionsChange,
  onDelete,
}: Props<T>) {

  const updateItem = (id: string, field: keyof TempPosten, value: string | number) => {
    onPositionsChange((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const changed = { ...item, [field]: value };
        changed.gesamtpreis = changed.menge * changed.einzelpreis;
        return changed;
      })
    );
  };

  const deleteTemplate = (rowData: T) => (
    <Button
      className="button-square"
      icon="pi pi-trash"
      style={{ color: 'red' }}
      text
      onClick={() => onDelete(rowData)}
    />
  );

  const descriptionEditTemplate = (rowData: T) => (
    <InputText
      value={rowData.beschreibung ?? ''}
      onChange={(e) => updateItem(rowData.id, 'beschreibung', e.target.value)}
    />
  );

  const quantityEditTemplate = (rowData: T) => (
    <InputNumber
      value={rowData.menge ?? 0}
      onValueChange={(e) => updateItem(rowData.id, 'menge', e.value ?? 0)}
    />
  );

  const priceSingleEditTemplate = (rowData: T) => (
    <InputNumber
      mode="currency"
      currency="EUR"
      locale="de-DE"
      value={rowData.einzelpreis ?? 0}
      onValueChange={(e) => updateItem(rowData.id, 'einzelpreis', e.value ?? 0)}
    />
  );

  const priceTotalTemplate = (rowData: T) => (
    <span>{formatCurrency(rowData.gesamtpreis)}</span>
  );

  return (
    <DataTable
      value={positions}
      dataKey="id"
      emptyMessage="Noch keine Posten angegeben."
      sortField="index"
      sortOrder={1}
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