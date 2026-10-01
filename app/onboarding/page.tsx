import { Metadata } from 'next';
import OnboardingClient from '../components/auth/OnboardingClient';

export const metadata: Metadata = {
  title: 'Onboarding | CONEK',
  description: '',
};

export default function OnboardingPage() {
  return (
    <main className="auth-page">
      <div className="container" style={{ maxWidth: 480, minHeight: 500 }}>
        <OnboardingClient />
      </div>
    </main>
  );
}
