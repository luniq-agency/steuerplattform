import { Metadata } from 'next';
import VorgangNeu from './VorgangNeu';

export const metadata: Metadata = {
    title: 'Neuer Vorgang | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <VorgangNeu />
    );
}