import { Metadata } from 'next';
import ProfileEditor from '@/app/components/ProfileEditor';

export const metadata: Metadata = {
  title: 'Mein Profil | CONEK',
  description: '',
};
export default function AdminProfile() {
  return (
    <div className="page-content column" style={{ backgroundColor: 'white', padding: 0 }}>
      <ProfileEditor />
    </div>
  );
}
