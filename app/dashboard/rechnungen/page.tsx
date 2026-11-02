import Dokumente from '@/app/dashboard/dokumente/Dokumente';
import { Metadata } from 'next';
import Rechnungen from './Rechnungen';

export const metadata: Metadata = {
    title: 'Rechnungen | ADVACT',
    description: '',
};

export default function DashboardDocumentsPage() {
    return (
        <Rechnungen />
    );
}
