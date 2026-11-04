
import { Metadata } from 'next';
import Dokumente from './Dokumente';

export const metadata: Metadata = {
  title: 'Dokumente | ADVACT',
  description: '',
};

export default function DashboardDocumentsPage() {
  return (
    <Dokumente />
  );
}
