import Image from 'next/image';
import DividerBlock from '../components/DividerBlock';
import { Metadata } from 'next';
import SigninForm from '../components/auth/SignUpForm';

export const metadata: Metadata = {
  title: 'Registrieren | ADVACT',
  description: '',
};

export default function Home() {
  return (
    <main className="auth-page" style={{backgroundImage: 'url(/backgrounds/auth-background.jpg'}}>
      <div className="form-wrapper" style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', zIndex: 4 }}>
        <Image alt="ADVACT Logo" height={30} src="/advact-logo-white.png" width={80} />
        <DividerBlock height={1} />
        <h2 style={{color: 'white'}}>Anmelden</h2>
        <DividerBlock height={0.5} />
        <span>Melde dich jetzt mit deinem ADVACT-Konto an.</span>
        <DividerBlock height={2} />
        <SigninForm />
      </div>
    </main>
  );
}
