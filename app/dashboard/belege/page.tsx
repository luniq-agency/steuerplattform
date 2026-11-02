import { Metadata } from 'next';
import Belege from './Belege';

export const metadata: Metadata = {
    title: 'Belege | ADVACT',
    description: '',
};

export default function DashboardDocumentsPage() {
    return (
        <Belege />
    );
}
