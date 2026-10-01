import Image from 'next/image';
import { SignInForm, SignInMigrateForm } from './components/auth/AuthForms';
import DividerBlock from './components/DividerBlock';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Anmelden | CONEK',
  description: '',
};

export default function Home() {
  return (
    <main className="auth-page">
      <Image alt="CONEK Logo" height={30} src="/conek-logo-weiss.svg" width={150} />
      <DividerBlock height={1} />
      <h2 style={{ color: 'white' }}>Anmelden</h2>
      <span style={{ color: 'white' }}>Melde dich jetzt mit deinem CONEK-Konto an.</span>
      <DividerBlock height={4} />
      <div style={{ maxWidth: 360, width: '100%' }}>
        <SignInMigrateForm />
      </div>
    </main>
  );
}
