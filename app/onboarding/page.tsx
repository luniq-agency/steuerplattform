import { Metadata } from 'next';
import OnboardingClient from '../components/auth/OnboardingClient';
import Row from '../components/layout/Row';
import Column from '../components/layout/Column';

export const metadata: Metadata = {
  title: 'Onboarding | ADVACT',
  description: '',
};

export default function OnboardingPage() {
  const bg = 'url(/bilder/hero.jpg)';

  return (
    <main className="auth-page">
      <Row height="100%">
        <Column alignItems='center' justifyContent='start' width="100%">
          <OnboardingClient />
        </Column>
        <div className="mobile-hidden" style={{ backgroundImage: bg, backgroundSize: 'cover', width: "100%" }} />
      </Row>
    </main>
  );
}
