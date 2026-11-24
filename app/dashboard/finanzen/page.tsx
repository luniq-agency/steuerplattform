import { Metadata } from 'next';
import Finanzen from './Finanzen';

export const metadata: Metadata = {
    title: 'Finanzen | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <Finanzen />
    );
}
