'use client';

import { Client, Invoice, InvoiceItem, User } from '@/app/types/Database';
import { formatCurrency } from '@/app/utils/formats';
import Image from 'next/image';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Divider } from 'primereact/divider';
import DividerBlock from '../../DividerBlock';
import { useEffect, useState } from 'react';
import { userLookup } from '@/app/actions/users';

interface Props {
  client: string;
  invoice: Invoice;
  invoiceItems: InvoiceItem[];
}

export default function InvoicePreview({ client, invoice, invoiceItems }: Props) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!client) return;

    const fetchData = async () => {
      const res = await userLookup(client);
      setUser(res);
    };
    fetchData();
  }, [client]);

  return (
    <div className="document-previewer">
      <div className="row space-between align-start">
        <div className="column">
          <h2>Rechnung</h2>
          <span>{invoice.invoice_number}</span>
        </div>
        <Image alt="CONEK Logo" height={20} src="/conek-logo-blue.svg" width={130} />
      </div>
      <Divider />
      <div className="row space-between align-start">
        <div className="column">
          <label>Rechnungssteller</label>
          <span>CONEK UG (haftungsbeschränkt)</span>
          <span>Haselnussweg 8</span>
          <span>31275 Hämelerwald</span>
        </div>
        <div className="column">
          <label>Rechnungsempfänger</label>
          <span>
            {user?.user_name_first} {user?.user_name_last}
          </span>
          <span>
            {user?.anschrift}
          </span>
          <span>
            {user?.plz} {user?.city}
          </span>
        </div>
      </div>
      <Divider />
      <DataTable value={invoiceItems}>
        <Column field="description" header="Beschreibung" />
        <Column
          bodyStyle={{ textAlign: 'center' }}
          field="quantity"
          header="Menge"
          style={{ width: '15%' }}
        />
        <Column
          body={(item) => formatCurrency(item.price_single)}
          bodyStyle={{ textAlign: 'center' }}
          field="price_single"
          header="Einzelpreis"
          style={{ width: '15%' }}
        />
        <Column
          body={(item) => formatCurrency(item.price_total)}
          bodyStyle={{ textAlign: 'right' }}
          field="price_total"
          header="Gesamtpreis"
          style={{ textAlign: 'right', width: '15%' }}
        />
      </DataTable>
      <div
        className="row space-between"
        style={{ fontSize: 18, fontWeight: 700, padding: '0px 1rem' }}
      >
        <span>Gesamtpreis</span>
        <span>{formatCurrency(invoice.invoice_total_gross)}</span>
      </div>
      <DividerBlock height={2} />
      {invoice.tax_rate >= 0 ? (
        <span>
          Die Rechnung enthält die Mehrwertsteuer ({invoice.tax_rate * 100}%) in Höhe von{' '}
          {formatCurrency(invoice.tax_amount)}.
        </span>
      ) : (
        <span>Die Rechnung enthält keine Mehrwertsteuer.</span>
      )}
      <span>Bei Fragen stehen wir dir gerne zur Verfügung.</span>
      <span>Mit freundlichen Grüßen</span>
      <span style={{ fontSize: 20 }}>
        <strong>Dein Team von CONEK</strong>
      </span>
    </div>
  );
}
