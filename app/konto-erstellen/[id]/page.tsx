import Image from 'next/image';
import { Metadata } from 'next';
import DividerBlock from '../../components/DividerBlock';
import Column from '../../components/layout/Column';
import Row from '../../components/layout/Row';
import InviteForm from '../../components/auth/InviteForm';
import { userLookup } from '@/app/actions/users';

export const metadata: Metadata = {
    title: 'Konto erstellen | ADVACT',
    description: '',
};

export default async function KontoErstellen({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const bg = 'url(/bilder/hero.jpg)';
    const data = await userLookup(Number(id));

    if (!data) return;

    return (
        <main className="auth-page">
            <Row height="100%">
                <Column alignItems="center" justifyContent="center">
                    <div style={{ maxWidth: 360, width: '100%' }}>
                        <Column alignItems="center" gap={0} justifyContent="center">
                            <Image alt="ADVACT Logo" height={30} src="/advact-logo-black.png" width={80} />
                            <DividerBlock height={1} />
                            <InviteForm email={data.email} />
                        </Column>
                    </div>
                </Column>
                <div className="mobile-hidden" style={{ backgroundImage: bg, backgroundSize: 'cover', width: '100%' }} />
            </Row>
        </main>
    );
}