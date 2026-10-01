import ClientEditor from '@/app/components/admin/clients/ClientEditor';
import DividerBlock from '@/app/components/DividerBlock';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meine Daten | CONEK',
  description: '',
};

export default function UserProfilePage() {
  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16}}>
      <div className="row space-between">
        <h1>Meine Daten</h1>
      </div>
      <DividerBlock height={2} />
      <ClientEditor />
    </div>
  );
}
