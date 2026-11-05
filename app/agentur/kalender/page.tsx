import { Metadata } from 'next';
import Kalender from './Kalender';

export const metadata: Metadata = {
    title: 'Kalender | ADVACT',
    description: '',
};

export default function DashboardDocumentsPage() {
    return (
        <Kalender />
    );
}
