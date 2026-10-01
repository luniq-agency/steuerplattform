import { clientsLoadAdmin } from '@/app/actions/clients';
import { invoicesLoadAll } from '@/app/actions/invoice';
import { Metadata } from 'next';
import Rechnungen from './Rechnungen';

export const metadata: Metadata = {
  title: 'Rechnungen | CONEK',
  description: '',
};

export default async function AdminInvoicesPage() {
  const clients = await clientsLoadAdmin();
  const invoices = await invoicesLoadAll();

  return <Rechnungen clients={clients} />;
}
