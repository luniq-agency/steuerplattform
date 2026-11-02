import Vorgänge from '@/app/dashboard/vorgaenge/Vorgänge';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meine Vorgänge | ADVACT',
  description: '',
};

export default function DashboardTicketsPage() {
  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16}}>
      <Vorgänge />
    </div>
  );
}