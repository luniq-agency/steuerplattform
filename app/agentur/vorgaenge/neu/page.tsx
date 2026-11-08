import { Metadata } from 'next';
import AgenturVorgangNeu from './AgenturVorgangNeu';

export const metadata: Metadata = {
    title: 'Neuer Vorgang | ADVACT',
    description: '',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ mandant?: string }> }) {
    const { mandant } = await searchParams;
    const mandantId = mandant && /^\d+$/.test(mandant) ? Number(mandant) : null;

    return <AgenturVorgangNeu vorauswahl={mandantId || undefined} />;
}