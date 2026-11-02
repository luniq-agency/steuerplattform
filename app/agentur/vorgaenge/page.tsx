import { Metadata } from 'next';
import AgenturVorgänge from './AgenturVorgänge';

export const metadata: Metadata = {
    title: 'Meine Vorgänge | ADVACT',
    description: '',
};

export default function DashboardTicketsPage() {
    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <AgenturVorgänge />
        </div>
    );
}