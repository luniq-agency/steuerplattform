import { Metadata } from 'next';
import { fetchInvoiceById } from '@/app/actions/documents/rechnungen';
import KundeBearbeiten from './Kunde';
import { fetchKundeById } from '@/app/actions/kunden';

export const metadata: Metadata = {
    title: 'Kunde bearbeiten | ADVACT',
    description: '',
};

export default async function DashboardDocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await fetchKundeById(id);

    return (
        <KundeBearbeiten client={client} />
    );
}
