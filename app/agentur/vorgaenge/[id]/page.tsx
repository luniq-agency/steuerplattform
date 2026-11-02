import { fetchVorgangById } from '@/app/actions/vorgang/vorgang';
import { Metadata } from 'next';
import AgenturVorgang from './AgenturVorgang';

export const metadata: Metadata = {
    title: 'Vorgang | ADVACT',
    description: '',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const vorgang = await fetchVorgangById(Number(id));

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <AgenturVorgang vorgang={vorgang} />
        </div>
    );
}