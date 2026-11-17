import { Metadata } from 'next';
import AdminVorgangNeu from './VorgangNeu';

export const metadata: Metadata = {
  title: 'Vorgang erstellen | ADVACT',
  description: '',
};

export default function Page() {
  return (
    <AdminVorgangNeu />
  )
}
