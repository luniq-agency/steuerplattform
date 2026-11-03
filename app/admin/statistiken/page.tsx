import { Metadata } from 'next';
import Statistiken from '@/app/admin/statistiken/Statistiken';

export const metadata: Metadata = {
  title: 'Statistiken | ADVACT',
  description: '',
};

export default function Page() {
  return <Statistiken />;
}
