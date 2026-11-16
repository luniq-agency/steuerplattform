import { Metadata } from 'next';
import RechnungNeu from './RechnungNeu';
import { userLookup } from '@/app/actions/users';

export const metadata: Metadata = {
  title: 'Neue Rechnung | ADVACT',
  description: '',
};

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ user?: string }> }) {
  const { user } = await searchParams;
  const mandant = await userLookup(Number(user));

  return <RechnungNeu user={mandant} />;
}
