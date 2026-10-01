import DocumentList from '@/app/components/documents/DocumentList';
import DividerBlock from '@/app/components/DividerBlock';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dokumente verwalten | CONEK',
  description: '',
};

export default function AdminDocumentPage() {
  return (
    <div className="page-content">
      <div className="row space-between">
        <h1>Dokumente verwalten</h1>
      </div>
      <DividerBlock height={2} />
      <div className="container">
        <DocumentList />
      </div>
    </div>
  );
}
