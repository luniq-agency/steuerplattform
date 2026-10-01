import TicketsClient from '@/app/components/tickets/TicketsClient';
import DividerBlock from '@/app/components/DividerBlock';
import { useAuth } from '@/app/context/AuthContext';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meine Tickets | CONEK',
  description: '',
};

export default function DashboardTicketsPage() {
  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16}}>
      <TicketsClient />
    </div>
  );
}