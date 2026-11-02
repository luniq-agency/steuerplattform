import { Metadata } from 'next';
import TicketsAdmin from '@/app/components/tickets/TicketsAdmin';
import { ticketsLoadAll } from '@/app/actions/tickets';
import { usersLoadAll } from '@/app/actions/users';

export const metadata: Metadata = {
  title: 'Tickets | ADVACT',
  description: '',
};

export default async function AdminInvoicesPage() {
  const tickets = await ticketsLoadAll();
  const users = await usersLoadAll();

  return <TicketsAdmin tickets={tickets} users={users} />;
}
