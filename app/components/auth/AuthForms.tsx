'use client';

import { Button } from 'primereact/button';
import { clientSignup } from '@/app/actions/clients';
import { createClient } from '@/app/utils/supabase/client';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { useEffect, useRef, useState } from 'react';
import { getEmails, login, resetPassword } from '@/app/actions/auth';
import Link from 'next/link';
import { PasswordInputIconAuth, TextInputIconAuth, TextInputLabel } from '../forms/FormElements';
import { useRouter } from 'next/navigation';
import { registerBubbleUser } from '@/app/actions/migrate';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { PrimaryButton } from '../buttons/Buttons';

const translateError = (message: string): string => {
  const errors: Record<string, string> = {
    'User already registered': 'Diese E-Mail-Adresse wird bereits verwendet.',
    'Invalid login credentials': 'E-Mail oder Passwort ist falsch.',
    'Email not confirmed': 'Bitte bestätige zuerst deine E-Mail-Adresse.',
    'Password should be at least 6 characters': 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    'Unable to validate email address: invalid format':
      'Bitte gib eine gültige E-Mail-Adresse ein.',
  };

  return errors[message] ?? 'Ein unbekannter Fehler ist aufgetreten.';
};

export function ClientSignupForm() {
  const router = useRouter();

  const toast = useRef<Toast | null>(null);

  // INPUTS
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = password !== passwordConfirm;

  const signup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await clientSignup(email, password);
      const supabase = createClient();
      await supabase.auth.setSession({
        access_token: data.session?.access_token!,
        refresh_token: data.session?.refresh_token!,
      });
      router.push('/onboarding');
    } catch (err: any) {
      const message = err?.message ?? 'Unbekannter Fehler';
      toast.current?.show({
        severity: 'error',
        summary: 'Registrierung nicht möglich',
        detail: translateError(message),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="column gap-l">
      <Toast position="top-center" ref={toast} />
      <form onSubmit={signup}>
        <div className="column gap-s">
          <TextInputIconAuth
            icon="pi pi-envelope"
            onChange={setEmail}
            placeholder="E-Mail-Adresse"
            value={email}
          />
          <PasswordInputIconAuth
            autoComplete="new-password"
            icon="pi pi-lock"
            placeholder="Passwort"
            onChange={setPassword}
            value={password}
          />
          <PasswordInputIconAuth
            autoComplete="new-password"
            icon="pi pi-lock"
            placeholder="Passwort wiederholen"
            onChange={setPasswordConfirm}
            value={passwordConfirm}
          />

          <Button
            className="button-auth"
            disabled={!email || !password || !passwordConfirm || passwordsMatch || submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Konto erstellen"
            onClick={signup}
          />
        </div>
      </form>
      <div className="column gap-m">
        <span style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
          Du hast schon ein Konto?
        </span>
        <Link href="/" style={{ width: '100%' }}>
          <Button className="button-secondary" label="Jetzt Anmelden" style={{ width: '100%' }} />
        </Link>
      </div>
    </div>
  );
}

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setSubmitting(false);
    }
  };

  return (
    <div className="column gap-l">
      <form onSubmit={signIn}>
        <div className="column gap-m">
          <InputText
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail"
            value={email}
          />
          <div className="column gap-xs">
            <Password
              autoComplete="current-password"
              feedback={false}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              value={password}
            />
            <Button
              className="container-link"
              label="Passwort vergessen?"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                marginLeft: 'auto',
                padding: 0,
                width: 'fit-content',
              }}
            />
          </div>
          <Button
            className="button-auth"
            disabled={!email || !password || submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Anmelden"
            onClick={signIn}
          />
          {error && <span style={{ color: 'pink', textAlign: 'center' }}>{error}</span>}
        </div>
      </form>
      <div className="column gap-m">
        <span style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
          Noch kein Konto?
        </span>
        <Link href="/registrieren" style={{ width: '100%' }}>
          <Button
            className="button-secondary"
            label="Jetzt registrieren"
            style={{ width: '100%' }}
          />
        </Link>
      </div>
    </div>
  );
}

export function SignInMigrateForm() {
  // STATES
  const [resetting, setResetting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);

  // INPUTS
  const [email, setEmail] = useState('');
  const [emailReset, setEmailReset] = useState('');
  const [password, setPassword] = useState('');

  const [emailList, setEmailList] = useState<string[]>([]);

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const res = await getEmails();
        setEmailList(res);
        console.log('Emails:', res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEmails(); // ← fehlte
  }, []);

  const sendResetRequest = async () => {
    if (!emailReset) return;
    console.log('Sending reset for:', emailReset);
    setResetting(true);
    try {
      await resetPassword(emailReset);
      setSubmitted(true);
      setResetting(false);
    } catch (err) {
      console.error(err);
    }
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (emailList.includes(email)) {
        await registerBubbleUser(email, password);
      } else {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) throw new Error(error.message);

        // Dann Server-seitig die Rolle prüfen und weiterleiten
        await login(email, password);
      }
    } catch (err) {
      console.error(err);
      setError('Keinen Benutzer mit diesen Daten gefunden.');
      setSubmitting(false);
    }
  };

  return (
    <div className="column gap-l">
      <Dialog
        header="Passwort zurücksetzen"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={visible}
      >
        {submitted ? (
          <div className="column gap-m">
            Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts gesendet.
          </div>
        ) : (
          <div className="column gap-m">
            <span className="text-s">
              Du hast dein Passwort vergessen? Dann gib einfach deine E-Mail-Adresse ein und wir
              senden dir einen Link zum Zurücksetzen deines Passworts.
            </span>
            <TextInputLabel label="E-Mail-Adresse" onChange={setEmailReset} value={emailReset} />
            <PrimaryButton
              disabled={!emailReset || resetting}
              label="Passwort zurücksetzen"
              onClick={sendResetRequest}
            />
          </div>
        )}
      </Dialog>
      <form onSubmit={signIn}>
        <div className="column gap-m">
          <InputText
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail"
            value={email}
          />
          <div className="column gap-xs">
            <Password
              autoComplete="current-password"
              feedback={false}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Passwort"
              value={password}
            />
            <Button
              className="container-link"
              label="Passwort vergessen?"
              onClick={(e) => {
                e.preventDefault();
                setVisible(true);
              }}
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                marginLeft: 'auto',
                padding: 0,
                width: 'fit-content',
              }}
              type="button"
            />
          </div>
          <Button
            className="button-auth"
            disabled={!email || !password || submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Anmelden"
            onClick={signIn}
          />
          {error && <span style={{ color: 'pink', textAlign: 'center' }}>{error}</span>}
        </div>
      </form>
      <div className="column gap-m">
        <span style={{ color: 'white', fontWeight: 600, textAlign: 'center' }}>
          Noch kein Konto?
        </span>
        <Link href="/registrieren" style={{ width: '100%' }}>
          <Button
            className="button-secondary"
            label="Jetzt registrieren"
            style={{ width: '100%' }}
          />
        </Link>
      </div>
    </div>
  );
}
