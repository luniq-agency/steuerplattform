import { Metadata } from 'next';
import Mitarbeiter from './Mitarbeiter';

export const metadata: Metadata = {
    title: 'Mitarbeiter | ADVACT',
    description: '',
};

export default function DashboardDocumentsPage() {
    return (
        <Mitarbeiter />
    );
}
