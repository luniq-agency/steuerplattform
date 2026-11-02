import { Metadata } from 'next';
import AgenturVorgangNeu from './AgenturVorgangNeu';

export const metadata: Metadata = {
    title: 'Neuer Vorgang | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <AgenturVorgangNeu />
    );
}