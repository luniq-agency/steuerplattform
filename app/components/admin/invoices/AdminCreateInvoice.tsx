'use client';

import { invoiceCreate, invoicesLoadAll } from '@/app/actions/invoice';
import { Client, User } from '@/app/types/Database';
import { useRouter } from 'next/navigation';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import { TextInputLabel } from '../../forms/FormElements';

interface Props {
  onCreate?: () => void;
  secondary?: boolean;
  user?: User;
  users: User[];
}
export default function AdminCreateInvoice({ onCreate, secondary, user, users }: Props) {
  const [visible, setVisible] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const fetchLastInvoice = async () => {
      try {
        const invoices = await invoicesLoadAll();
        if (invoices.length === 0) return;

        const last = invoices.sort(
          (a, b) => Number(b.invoice_number) - Number(a.invoice_number)
        )[0];

        const nextNumber = (Number(last.invoice_number) + 1).toString();
        setInvoicePlaceholder(nextNumber);
        if (onCreate) onCreate();
      } catch (err) {
        console.error(err);
      }
    };
    fetchLastInvoice();
  }, []);

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoicePlaceholder, setInvoicePlaceholder] = useState('');
  const [selectedClient, setSelectedClient] = useState<User | null>(null);

  const createInvoice = async () => {
    const number = invoiceNumber ? invoiceNumber : invoicePlaceholder;
    const payload = user
      ? {
          invoice_number: number,
          invoice_status: 'draft',
          invoice_total_gross: 0,
          invoice_total_net: 0,
          tax_amount: 0,
          tax_rate: 0,
          user: user.id,
        }
      : {
          invoice_number: number,
          invoice_status: 'draft',
          invoice_total_gross: 0,
          invoice_total_net: 0,
          tax_amount: 0,
          tax_rate: 0,
          user: selectedClient?.id,
        };

    try {
      const res = await invoiceCreate(payload);
      router.push(`/admin/rechnungen/${res.id}`);
      setVisible(false);
    } catch (err) {
      console.error(err);
    }
    setSelectedClient(null);
  };

  const userOptions = users
    .map((u) => ({
      ...u,
      fullName: `${u.user_name_last}, ${u.user_name_first}`,
    }))
    .sort((a, b) => a.user_name_last.localeCompare(b.user_name_last));

  return (
    <>
      <Dialog
        closable={true}
        draggable={false}
        header="Rechnung erstellen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 640, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <div className="column gap-xs">
            <label>Kunde</label>
            <Dropdown
              filter
              filterPlaceholder="Suchen"
              onChange={(e) => setSelectedClient(e.value)}
              optionLabel="fullName"
              optionValue=""
              options={userOptions}
              value={user ? user : selectedClient}
            />
          </div>
          <TextInputLabel
            label="Rechnungsnummer"
            onChange={setInvoiceNumber}
            placeholder={invoicePlaceholder}
            value={invoiceNumber}
          />
          <Button
            className="button-primary"
            disabled={!selectedClient}
            label="Rechnung erstellen"
            onClick={createInvoice}
            style={{ width: 'fit-content' }}
          />
        </div>
      </Dialog>
      <Button
        className={secondary ? 'button-secondary' : 'button-primary'}
        icon="pi pi-plus"
        label="Rechnung erstellen"
        onClick={() => setVisible(true)}
      />
    </>
  );
}
