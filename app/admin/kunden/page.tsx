import { Metadata } from 'next';
import Clients from '@/app/components/pages/admin/Clients';

export const metadata: Metadata = {
  title: 'Kunden | CONEK',
  description: '',
};

export default function AdminClientsPage() {
  return (
    <Clients />
  );
}
