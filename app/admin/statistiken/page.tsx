import { Metadata } from 'next';
import StatPageClient from '@/app/components/admin/stats/StatPageClient';

export const metadata: Metadata = {
  title: 'Statistiken | CONEK',
  description: '',
};

export default function Page() {
  return <StatPageClient />;
}
