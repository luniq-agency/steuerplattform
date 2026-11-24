
import ProfilEditor from '@/app/components/clients/profil/ProfilEditor';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Meine Daten | ADVACT',
  description: '',
};

export default function UserProfilePage() {
  return (
    <ProfilEditor />
  );
}
