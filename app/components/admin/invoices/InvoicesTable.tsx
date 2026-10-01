'use client';

import { Client, Invoice, User } from '@/app/types/Database';
import { invoice_status } from '@/app/constants/Constants';
import { formatCurrency, formatDate } from '@/app/utils/formats';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { MultiSelect } from 'primereact/multiselect';
import { Sidebar } from 'primereact/sidebar';
import { useEffect, useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import InvoiceEditor from './InvoiceEditor';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import {
  invoiceDelete,
  invoicesDeleteMultiple,
  invoicesLoadAll,
  invoicesLoadUser,
  invoiceUpdate,
} from '@/app/actions/invoice';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import AdminCreateInvoice from './AdminCreateInvoice';
import { useRouter } from 'next/navigation';
import Floater from '../../ui/Floater';
import { ContextButton, DeleteButton, PrimaryButton, SecondaryButton } from '../../buttons/Buttons';
import { Trash } from 'lucide-react';
import { Dialog } from 'primereact/dialog';
import Row from '../../layout/Row';
import DividerBlock from '../../DividerBlock';
import Tag from '../../ui/Tag';
import SearchBox from '../../forms/SearchBox';
import { SelectLabel } from '../../inputs/Select';

interface Props {
  clients?: User[];
  user?: User;
}

export default function InvoicesTable({ clients }: Props) {
  const { userProfile } = useAuth();
  const router = useRouter();

  // INPUTS
  const [search, setSearch] = useState('');

  // STATES
  const [deleting, setDeleting] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  const op = useRef<OverlayPanel | null>(null);

  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!clients) return;

    const fetchData = async () => {
      try {
        const res = await invoicesLoadAll();
        setInvoicesList(res);
      } catch {}
    };
    fetchData();
  }, [clients]);

  const [rowClick, setRowClick] = useState(true);

  // FILTER
  const enrichedInvoices = invoicesList.map((invoice) => {
    const client = clients?.find((c) => c.id === invoice.user);
    return {
      ...invoice,
      recipientName: client ? `${client.user_name_last}, ${client.user_name_first}` : '',
    };
  });

  const filteredInvoices = enrichedInvoices.filter((invoice) => {
    const matchesSearch = invoice.recipientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter.length === 0 || statusFilter.includes(invoice.invoice_status);
    return matchesSearch && matchesStatus;
  });

  // ACTIONS
  const cancelDelete = () => {
    setDeleting(false);
    setSelectedInvoice(null);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    setDeleting(false);

    try {
      await invoiceDelete(selectedInvoice.id);
      const res = await invoicesLoadAll();
      setInvoicesList(res);
      setSelectedInvoices([]);
      toast.current?.show({
        severity: 'success',
        summary: 'Rechnungen gelöscht',
        detail: 'Die Rechnungen wurde erfolgreich gelöscht.',
      });
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler aufgetreten',
        detail: 'Die Rechnung konnte nicht gelöscht werden. Probiere es bitte noch einmal.',
      });
    }
  };

  const markAsPaid = async () => {
    if (selectedInvoices.length === 0) return;

    try {
      await Promise.all(
        selectedInvoices.map((invoice) => invoiceUpdate({ invoice_status: 'paid' }, invoice.id))
      );
      const res = await invoicesLoadAll();
      setInvoicesList(res);
      setSelectedInvoices([]);
      toast.current?.show({
        severity: 'success',
        summary: 'Rechnungen aktualisiert',
        detail: 'Die Rechnungen wurden als bezahlt markiert.',
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

  const markForDelete = (i: Invoice) => {
    console.log('Rechnung:', i);
    setSelectedInvoice(i);
    setDeleting(true);
  };

  const resetFilter = () => {
    setStatusFilter('');
  };

  //TEMPLATES
  const actionTemplate = (rowData: Invoice) => {
    return (
      <div className="row gap-xs">
        <Link href={`/admin/rechnungen/${rowData.id}`}>
          <Button className="button-square" icon="pi pi-pencil" />
        </Link>
        <ContextButton color="red" icon={Trash} onClick={() => markForDelete(rowData)} />
      </div>
    );
  };

  const recipientTemplate = (rowData: Invoice) => {
    if (!clients) return;

    const client = clients.find((c) => c.id === rowData.user);
    if (!client) return <span>–</span>;
    return (
      <span>
        {client.user_name_last}, {client.user_name_first}
      </span>
    );
  };

  // TEMPLATES
  const dateTemplate = (rowData: Invoice) => {
    if (!rowData.invoice_date) return <span>–</span>;

    return <span>{formatDate(rowData.invoice_date)}</span>;
  };

  const dueDateTemplate = (rowData: Invoice) => {
    if (!rowData.invoice_date_due) return <span>–</span>;
    const color = rowData.invoice_date_due < new Date() ? 'red' : 'inherit';
    return <span style={{ color }}>{formatDate(rowData.invoice_date_due)}</span>;
  };

  const headerTemplate = (
    <Row justifyContent="space-between">
      <Row alignItems="center" justifyContent="end">
        <SearchBox maxWidth={250} onChange={setSearch} value={search} />
        <SelectLabel
          maxWidth={250}
          onChange={setStatusFilter}
          onClear={resetFilter}
          options={invoice_status}
          optionLabel="label"
          optionValue="value"
          placeholder="Status"
          value={statusFilter}
        />
      </Row>
    </Row>
  );

  const statusTemplate = (rowData: Invoice) => {
    const status = invoice_status.find((t) => t.value === rowData.invoice_status);
    return (
      <Tag
        bgColor={status?.bg || 'var(--primary)'}
        color={status?.color || 'white'}
        text={status?.label || ''}
      />
    );
  };

  const totalTemplate = (rowData: Invoice) => {
    return <span>{formatCurrency(rowData.invoice_total_gross)}</span>;
  };

  const show = async () => {
    const res = await invoicesLoadAll();
    setInvoicesList(res);
    toast.current?.show({
      severity: 'success',
      summary: 'Rechnung aktualisiert',
      detail: 'Die Rechnung wurde aktualisiert.',
    });
  };

  const sidebarHeader = () => {
    return <h3>Rechnung {selectedInvoice?.invoice_number}</h3>;
  };

  return (
    <>
      <Toast ref={toast} />
      {selectedInvoices.length >= 1 && (
        <Floater>
          <div className="column gap-s">
            <span className="text-s">{selectedInvoices.length} Rechnung(en) ausgewählt</span>
            <PrimaryButton label="Als bezahlt markieren" onClick={markAsPaid} size="small" />
          </div>
        </Floater>
      )}
      <Sidebar
        header={sidebarHeader}
        onHide={() => setVisible(false)}
        position="right"
        style={{ maxWidth: '60vw', width: '100%' }}
        visible={visible}
      >
        {clients ? (
          <InvoiceEditor clients={clients} invoice={selectedInvoice!} onSubmit={show} />
        ) : (
          <div className="column">
            <span style={{ textAlign: 'center' }}>
              Es wurden noch keine Kunden angelegt. Bitte lege zuerst einen Kunden an, bevor du
              fortfährst.
            </span>
            <Link href="/admin/kunden">
              <Button label="zu den Kunden" />
            </Link>
          </div>
        )}
      </Sidebar>
      <Dialog
        draggable={false}
        header="Rechnung löschen"
        onHide={cancelDelete}
        style={{ maxWidth: 480 }}
        visible={deleting}
      >
        <span>
          Bist du sicher, dass du die Rechnung löschen möchtest? Das kann nicht rückgängig gemacht
          werden!
        </span>
        <DividerBlock height={1} />
        <Row alignItems="center" gap={8} justifyContent="end">
          <SecondaryButton label="Abbrechen" onClick={cancelDelete} />
          <DeleteButton label="Löschen" onClick={confirmDelete} />
        </Row>
      </Dialog>
      <DataTable
        emptyMessage="Keine Rechnungen gefunden."
        header={headerTemplate}
        onSelectionChange={(e: any) => setSelectedInvoices(e.value)}
        paginator
        rows={10}
        selection={selectedInvoices}
        selectionMode={rowClick ? null : 'checkbox'}
        sortField="invoice_number"
        sortOrder={-1}
        stripedRows
        value={filteredInvoices}
      >
        <Column selectionMode="multiple" header="" headerStyle={{ width: '3rem' }} />
        <Column field="invoice_number" header="#" sortable />
        <Column
          body={recipientTemplate}
          field="recipientName"
          header="Empfänger"
          hidden={!clients}
          sortable
        />
        <Column body={dateTemplate} header="Rechnungsdatum" sortable />
        <Column body={dueDateTemplate} header="Fälligkeitsdatum" sortable />
        <Column body={totalTemplate} field="invoice_total_gross" header="Betrag" sortable />
        <Column body={statusTemplate} field="status" header="Status" />
        <Column body={actionTemplate} header="Aktionen" />
      </DataTable>
    </>
  );
}

export function InvoicesTableUser({ user }: Props) {
  const { userProfile } = useAuth();
  const [visible, setVisible] = useState(false);
  const toast = useRef<Toast | null>(null);

  const op = useRef<OverlayPanel | null>(null);

  const [invoicesList, setInvoicesList] = useState<Invoice[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const res = await invoicesLoadUser(user.id);
        setInvoicesList(res);
      } catch {}
    };
    fetchData();
  }, [user]);

  const [rowClick, setRowClick] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>([]);

  const deleteDialog = (invoice: Invoice) => {
    confirmDialog({
      message: 'Bist du sicher, dass du diese Rechnung löschen möchtest?',
      header: 'Rechnung löschen',
      accept: () => acceptDelete(invoice),
      acceptLabel: 'Löschen',
      reject: rejectDelete,
      rejectLabel: 'Abbrechen',
    });
  };

  //AKTIONEN
  const acceptDelete = async (invoice: Invoice) => {
    if (!selectedInvoice) return;

    try {
      await invoiceDelete(selectedInvoice.id);
      const res = await invoicesLoadAll();
      setInvoicesList(res);
      toast.current?.show({
        severity: 'success',
        summary: 'Rechnung gelöscht',
        detail: 'Die Rechnung wurde gelöscht.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMultipleInvoices = async () => {
    if (selectedInvoices.length === 0) return;

    try {
      await invoicesDeleteMultiple(selectedInvoices.map((i) => i.id));
      const res = await invoicesLoadAll();
      setInvoicesList(res);
      setSelectedInvoices([]);
      toast.current?.show({
        severity: 'success',
        summary: 'Rechnungen gelöscht',
        detail: 'Die Rechnungen wurden erfolgreich gelöscht.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markInvoicePaid = async (rowData: Invoice) => {
    const payload = {
      invoice_status: 'paid',
    };

    try {
      await invoiceUpdate(payload, rowData.id);
      toast.current?.show({
        severity: 'success',
        summary: 'Rechnung aktualisiert',
        detail: 'Die Rechnung wurde als bezahlt markiert.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  const refreshInvoices = async () => {
    if (!user) return;
    const res = await invoicesLoadUser(user.id);
    setInvoicesList(res);
  };

  const selectInvoice = (rowData: Invoice) => {
    setSelectedInvoice(rowData);
    setVisible(true);
  };

  const selectInvoiceforDelete = (rowData: Invoice) => {
    op.current?.hide();
    deleteDialog(rowData);
  };

  const sendInvoice = async (rowData: Invoice) => {
    console.log('Rechnung:', rowData);
    try {
      toast.current?.show({
        severity: 'success',
        summary: 'Rechnung versendet',
        detail: 'Die Rechnung wurde an den Kunden versendet.',
      });
    } catch (err) {
      console.error(err);
    }
  };

  //TEMPLATES
  const actionTemplate = (rowData: Invoice) => {
    return (
      <div className="row gap-xs">
        <ConfirmDialog />
        <OverlayPanel ref={op}>
          <div className="column gap-xs">
            <Button className="button-context" icon="pi pi-envelope" label="Rechnung versenden" />
            <Button
              className="button-context"
              disabled={rowData.invoice_status === 'paid'}
              icon="pi pi-euro"
              label="Als bezahlt markieren"
              onClick={() => markInvoicePaid(rowData as Invoice)}
            />
            <Button
              className="button-context"
              disabled={rowData.invoice_status === 'paid' || rowData.invoice_status === 'sent'}
              icon="pi pi-trash"
              label="Rechnung löschen"
              onClick={() => selectInvoiceforDelete(rowData as Invoice)}
              style={{ color: 'red' }}
            />
          </div>
        </OverlayPanel>
        {userProfile?.user_role === 'admin' && (
          <>
            <Link href={`/admin/rechnungen/${rowData.id}`}>
              <Button className="button-square" icon="pi pi-pencil" />
            </Link>
            <Button
              className="button-square"
              icon="pi pi-ellipsis-v"
              onClick={(e) => op.current?.toggle(e)}
            />
          </>
        )}
      </div>
    );
  };

  const rejectDelete = () => {
    op.current?.hide();
  };

  const statusTemplate = (rowData: Invoice) => {
    const status = invoice_status.find((t) => t.value === rowData.invoice_status);
    return (
      <Tag
        bgColor={status?.bg || 'var(--primary)'}
        color={status?.color || 'white'}
        text={status?.label || ''}
      />
    );
  };

  const totalTemplate = (rowData: Invoice) => {
    return <span>{formatCurrency(rowData.invoice_total_gross)}</span>;
  };

  const show = async () => {
    const res = await invoicesLoadAll();
    setInvoicesList(res);
    toast.current?.show({
      severity: 'success',
      summary: 'Rechnung aktualisiert',
      detail: 'Die Rechnung wurde aktualisiert.',
    });
  };

  const sidebarHeader = () => {
    return <h3>Rechnung {selectedInvoice?.invoice_number}</h3>;
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="column gap-m">
        <div className="row space-between">
          <h3>Rechnungen</h3>
          <AdminCreateInvoice
            onCreate={refreshInvoices}
            secondary={true}
            user={user}
            users={user ? [user] : []}
          />
        </div>
        {selectedInvoices.length >= 1 && (
          <Button label="Löschen" onClick={deleteMultipleInvoices} />
        )}
        <DataTable
          emptyMessage="Keine Rechnungen gefunden."
          onSelectionChange={(e: any) => setSelectedInvoices(e.value)}
          paginator
          rows={10}
          selection={selectedInvoices}
          selectionMode={rowClick ? null : 'checkbox'}
          stripedRows
          value={invoicesList}
        >
          <Column selectionMode="multiple" header="" headerStyle={{ width: '3rem' }}></Column>
          <Column field="invoice_number" header="#" sortable />
          <Column
            body={(rowData) => formatDate(rowData.created_at)}
            field="created_at"
            header="Datum"
            sortable
          />
          <Column body={totalTemplate} field="invoice_total_gross" header="Betrag" />
          <Column body={statusTemplate} field="status" header="Status" />
          <Column body={actionTemplate} header="Aktionen" />
        </DataTable>
      </div>
    </>
  );
}
