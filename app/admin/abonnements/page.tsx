import { Metadata } from 'next';
import Abonnements from './Abonnements';
import { usersLoadByRole } from '@/app/actions/users';

export const metadata: Metadata = {
    title: 'Abonnements | ADVACT',
    description: '',
};

export default async function Page() {
    const clients = await usersLoadByRole('client');
    
    return (
        <Abonnements clients={clients} />
    )
}