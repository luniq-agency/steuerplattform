import DividerBlock from '@/app/components/DividerBlock';
import DocumentExplorer from '@/app/components/documents/DocumentExplorer';
import DocumentUploader from '@/app/components/documents/DocumentUploader';
import DocumentViewer from '@/app/components/documents/DocumentViewer';
import Documents from '@/app/components/pages/clients/Documents';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meine Dokumente | CONEK',
  description: '',
};

export default function DashboardDocumentsPage() {
  return (
    <Documents/>
  );
}
