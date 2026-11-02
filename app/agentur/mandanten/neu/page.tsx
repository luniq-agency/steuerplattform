import { Metadata } from 'next';
import MandantNeu from './MandantNeu';

export const metadata: Metadata = {
    title: 'Mandant anlegen | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <MandantNeu />
    );
}
