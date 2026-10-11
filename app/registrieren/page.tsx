import Image from 'next/image';
import { ClientSignupForm } from '../components/auth/AuthForms';
import DividerBlock from '../components/DividerBlock';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registrieren | ADVACT',
  description: '',
};

export default function Home() {
  return (
    <main className="auth-page">
      <Image alt="ADVACT Logo" height={30} src="/conek-logo-weiss.svg" width={150} />
      <DividerBlock height={1} />
      <h2 style={{ color: 'white' }}>Konto erstellen</h2>
      <span style={{ color: 'white' }}>Erstelle jetzt dein ADVACT-Konto.</span>
      <DividerBlock height={2} />
      <div style={{ maxWidth: 360, width: '100%' }}>
        <ClientSignupForm />
      </div>
    </main>
  );
}
