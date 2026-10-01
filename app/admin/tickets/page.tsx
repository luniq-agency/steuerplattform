import styles from '../../components/admin/Admin.module.css';
import { Metadata } from 'next';
import DividerBlock from '@/app/components/DividerBlock';
import InvoicesTable from '@/app/components/admin/invoices/InvoicesTable';
import { invoicesLoadAll } from '@/app/actions/invoice';
import AdminCreateInvoice from '@/app/components/admin/invoices/AdminCreateInvoice';
import { clientsLoadAll } from '@/app/actions/clients';
import TicketsAdmin from '@/app/components/tickets/TicketsAdmin';
import { ticketsLoadAll } from '@/app/actions/tickets';
import { usersLoadAll } from '@/app/actions/users';

export const metadata: Metadata = {
  title: 'Tickets | CONEK',
  description: '',
};

export default async function AdminInvoicesPage() {
  const tickets = await ticketsLoadAll();
  const users = await usersLoadAll();

  return <TicketsAdmin tickets={tickets} users={users} />;
}
