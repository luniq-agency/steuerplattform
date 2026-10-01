import { userLookup } from '@/app/actions/users';
import AdminSignupForm from '@/app/components/admin/admins/AdminSignupForm';
import DividerBlock from '@/app/components/DividerBlock';
import { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Konto erstellen | CONEK',
  description: '',
};

export default async function CreateAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const profile = await userLookup(id);

  if (!profile)
    return (
      <main className="auth-page" style={{ width: '100vw' }}>
        <Image alt="CONEK Logo" height={30} src="/conek-logo-weiss.svg" width={150} />
        <DividerBlock height={1} />
        <h2 style={{ color: 'white' }}>Konto erstellen</h2>
        <span style={{ color: 'white' }}>
          Wir konnten keine Einladung mit diesen Daten finden. Bitte wende dich an einen
          Administrator.
        </span>
      </main>
    );

  return (
    <main className="auth-page" style={{ width: '100vw' }}>
      <Image alt="CONEK Logo" height={30} src="/conek-logo-weiss.svg" width={150} />
      <DividerBlock height={1} />
      <h2 style={{ color: 'white' }}>Konto erstellen</h2>
      <div style={{ maxWidth: 360, width: '100%' }}>
        {profile.user_role === 'admin' || profile.user_role === 'agency' ? (
          <div className="column">
            <span style={{ color: 'white', textAlign: 'center' }}>
              {profile.user_role === 'admin' ? (
                <span>
                  Du wurdest zu CONEK eingeladen. <br />
                  Erstelle jetzt dein Admin-Konto.
                </span>
              ) : (
                <span>
                  Du wurdest zu CONEK eingeladen. <br />
                  Erstelle jetzt dein Agentur-Konto.
                </span>
              )}
            </span>
            <DividerBlock height={2} />
            <AdminSignupForm email={profile.email} role={profile.user_role} user={profile} />
          </div>
        ) : (
          <span>
            Deine Einladung ist entweder abgelaufen oder ungültig. Kontaktiere bitte einen Admin.
          </span>
        )}
      </div>
    </main>
  );
}
