import { clientsLoadAdmin } from '@/app/actions/clients';
import { invoicesLoadTeam } from '@/app/actions/invoice';
import { Metadata } from 'next';
import Rechnungen from './Rechnungen';

export const metadata: Metadata = {
  title: 'Rechnungen | ADVACT',
  description: '',
};

export default async function AdminInvoicesPage() {
  const clients = await clientsLoadAdmin();
  const invoices = await invoicesLoadTeam(7);

  return <Rechnungen clients={clients} invoices={invoices} />;
}
