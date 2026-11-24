import { Metadata } from 'next';
import RechnungNeu from './RechnungNeu';

export const metadata: Metadata = {
    title: 'Rechnung erstellen | ADVACT',
    description: '',
};

export default function DashboardDocumentsPage() {
    return (
        <RechnungNeu />
    );
}
