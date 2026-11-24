import { Metadata } from 'next';
import Rechnung from './Rechnung';
import { fetchInvoiceById } from '@/app/actions/documents/rechnungen';

export const metadata: Metadata = {
    title: 'Rechnung bearbeiten | ADVACT',
    description: '',
};

export default async function DashboardDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const invoice = await fetchInvoiceById(id);

    return (
        <Rechnung invoice={invoice} />
    );
}
