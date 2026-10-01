import { Metadata } from 'next';
import { userLookup } from '@/app/actions/users';
import KundeDetailPage from './KundeDetailPage';

export const metadata: Metadata = {
  title: 'Kundenprofil | CONEK',
  description: '',
};

export default async function AdminClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await userLookup(id);
  const bearbeiter = user.bearbeiter ? await userLookup(user.bearbeiter) : null;

  return <KundeDetailPage bearbeiter={bearbeiter} user={user} />;
}
