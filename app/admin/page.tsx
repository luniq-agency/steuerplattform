import AdminDashboard from './AdminDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mein Dashboard | ADVACT',
  description: '',
};

export default function Page() {
  return (
    <AdminDashboard />
  );
}
