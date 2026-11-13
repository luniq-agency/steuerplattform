import { Metadata } from 'next';
import KundeNeu from '@/app/dashboard/kunden/neu/KundeNeu';

export const metadata: Metadata = {
    title: 'Kunden anlegen | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <KundeNeu />
    );
}
