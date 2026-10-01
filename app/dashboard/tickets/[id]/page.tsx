import { ticketLoadSingle } from '@/app/actions/tickets';
import { Metadata } from 'next';
import TicketPageClient from '@/app/components/tickets/TicketPageClient';

export const metadata: Metadata = {
  title: 'Ticket | CONEK',
  description: '',
};

export default async function ClientTicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await ticketLoadSingle(id);

  return <TicketPageClient ticket={ticket} />;
}
