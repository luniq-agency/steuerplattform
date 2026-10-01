import { invoiceLoadSingle } from '@/app/actions/invoice';
import { Metadata } from 'next';
import RechnungPage from './RechnungPage';

export const metadata: Metadata = {
  title: 'Rechnung | CONEK',
  description: '',
};

export default async function AdminInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await invoiceLoadSingle(id);

  return <RechnungPage invoice={invoice} />;
}
