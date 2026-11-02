import { Metadata } from 'next';
import AgenturDashboard from './AgenturDashboard';

export const metadata: Metadata = {
    title: 'Home | ADVACT',
    description: '',
};

export default function Page() {
    return (
        <AgenturDashboard />
    );
}
