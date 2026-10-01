'use client';

import { User } from '@/app/types/Database';
import { PasswordInputIconAuth, TextInputIconAuth } from '../../forms/FormElements';
import { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { adminCompleteAccount } from '@/app/actions/admin';
import { redirect, useRouter } from 'next/navigation';
import { agencySignup } from '@/app/actions/agency';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

interface Props {
  email?: string;
  role: string;
  user: User;
}

export default function AdminSignupForm({ email, role, user }: Props) {
  const router = useRouter();
  const toast = useRef<Toast | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const hasProfile = user.user_uuid;
  
  // INIT
  useEffect(() => {
    if (!hasProfile) return;
    switch (user.user_role) {
      case 'admin':
        router.push('/admin');
      case 'agency':
        router.push('/admin');
      default:
    }
  }, [hasProfile]);

  const createAccount = async (e: React.FormEvent) => {
    if (!role) console.error('Keine Rolle ausgewählt!');
    console.log('E-Mail:', email);
    e.preventDefault();
    setSubmitting(true);
    if (role === 'admin')
      try {
        await adminCompleteAccount(user.email, password, user.user_role);
        router.push('/admin');
      } catch (err) {
        console.error(err);
      }
    else
      try {
        if (!email) return;
        await agencySignup(email, user.id, password);
        router.push('/admin');
      } catch (err) {
        console.error(err);
        setSubmitting(false);
        toast.current?.show({
          severity: 'error',
          summary: 'Fehler aufgetreten',
          detail: 'Die Registrierung konnte nicht abgeschlossen werden. Bitte probiere es erneut.',
        });
      }
  };

  return (
    <>
      <Toast ref={toast} />
      <form onSubmit={createAccount}>
        <div className="column gap-s">
          <InputText value={user.email} />
          <PasswordInputIconAuth
            autoComplete="new-password"
            icon="pi pi-lock"
            onChange={setPassword}
            placeholder="Passwort"
            value={password}
          />
          <PasswordInputIconAuth
            autoComplete="new-password"
            icon="pi pi-lock"
            onChange={setPasswordRepeat}
            placeholder="Passwort wiederholen"
            value={passwordRepeat}
          />
          <Button
            disabled={!password || !passwordRepeat}
            icon={submitting ? 'pi pi-spinner pi-spin' : undefined}
            label="Konto erstellen"
            onClick={createAccount}
          />
        </div>
      </form>
    </>
  );
}
