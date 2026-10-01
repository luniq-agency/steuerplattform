'use client';

import { createClient } from '@/app/utils/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import DividerBlock from '../components/DividerBlock';
import { TertiaryButton } from '../components/buttons/Buttons';
import Link from 'next/link';
import { AuthPasswordInput } from '../components/forms/AuthInputs';

export default function PasswordReset() {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    setSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error(error);
    } else {
      router.push('/');
    }
    setSubmitting(false);
  };

  return (
    <main className="auth-page">
      <Link href="/">
        <Image alt="CONEK Logo" height={30} src="/conek-logo-weiss.svg" width={150} />
      </Link>
      <DividerBlock height={1} />
      <div className="column gap-m">
        <h2 style={{ color: 'white' }}>Neues Passwort setzen</h2>
        <AuthPasswordInput onChange={setPassword} placeholder="Neues Passwort" value={password} />
        <TertiaryButton
          disabled={!password || submitting}
          label="Passwort speichern"
          onClick={handleReset}
        />
      </div>
    </main>
  );
}
