import Image from 'next/image';
import DividerBlock from '../components/DividerBlock';
import { Metadata } from 'next';
import SignUpForm from '../components/auth/SignUpForm';
import Column from '../components/layout/Column';
import Row from '../components/layout/Row';

export const metadata: Metadata = {
  title: 'Registrieren | ADVACT',
  description: '',
};

export default function Registrieren() {
  const bg = 'url(/bilder/hero.jpg)';

  return (
    <main className="auth-page">
      <Row height="100%">
        <Column alignItems='center' justifyContent='center'>
          <div style={{ maxWidth: 360, width: "100%" }}>
            <Column alignItems='center' gap={0} justifyContent='center'>
              <Image alt="ADVACT Logo" height={30} src="/advact-logo-black.png" width={80} />
              <DividerBlock height={1} />
              <h1 className='h1-fancy'>Konto erstellen</h1>
              <DividerBlock height={0.5} />
              <span>Erstelle jetzt dein ADVACT-Konto.</span>
              <DividerBlock height={2} />
              <SignUpForm />
            </Column>
          </div>
        </Column>
        <div className="mobile-hidden" style={{ backgroundImage: bg, backgroundSize: 'cover', width: "100%" }} />
      </Row>
    </main>
  );
}
