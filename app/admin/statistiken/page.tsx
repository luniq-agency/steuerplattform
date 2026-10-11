import { Metadata } from 'next';
import StatPageClient from '@/app/components/admin/stats/StatPageClient';

export const metadata: Metadata = {
  title: 'Statistiken | ADVACT',
  description: '',
};

export default function Page() {
  return <StatPageClient />;
}
