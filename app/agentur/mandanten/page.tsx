import { Metadata } from 'next';
import Mandanten from './Mandanten';

export const metadata: Metadata = {
    title: 'Mandanten | ADVACT',
    description: '',
};

export default function DashboardDocumentsPage() {
    return (
        <Mandanten />
    );
}
