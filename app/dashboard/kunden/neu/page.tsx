import { Metadata } from 'next';
import KundeNeu from './KundeNeu';

export const metadata: Metadata = {
    title: 'Kunde anlegen | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <KundeNeu />
    );
}
