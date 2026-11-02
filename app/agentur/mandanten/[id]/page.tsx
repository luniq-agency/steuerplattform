import { Metadata } from 'next';
import { userLookup } from '@/app/actions/users';
import Mandant from './Mandant';

export const metadata: Metadata = {
    title: 'Mandant | ADVACT',
    description: '',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const client = await userLookup(Number(id));

    return (
        <div className="content-wrapper" style={{ padding: 0}}>
            <Mandant user={client} />
        </div>
    );
}
