import { Metadata } from 'next';
import RechnungNeu from './RechnungNeu';

export const metadata: Metadata = {
  title: 'Neue Rechnung | ADVACT',
  description: '',
};

export default async function AdminInvoicesPage() {
  return <RechnungNeu />;
}
