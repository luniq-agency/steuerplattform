import Dashboard from '../components/pages/clients/Dashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mein Dashboard | ADVACT',
  description: '',
};

export default function DashboardPage() {

  return (
    <Dashboard />
  );
}
