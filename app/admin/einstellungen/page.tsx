import DividerBlock from '@/app/components/DividerBlock';
import UserSettings from '@/app/components/UserSettings';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Einstellungen | CONEK',
  description: '',
};

export default function AdminSettingsPage() {
  return (
    <div className="page-content">
      <div className="row space-between">
        <h1>Einstellungen & Profil</h1>
      </div>
      <DividerBlock height={2} />
      <div className="container">
        <UserSettings />
      </div>
    </div>
  );
}
