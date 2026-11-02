import Dokumente from '@/app/dashboard/dokumente/Dokumente';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meine Dokumente | ADVACT',
  description: '',
};

export default function DashboardDocumentsPage() {
  return (
    <Dokumente />
  );
}
