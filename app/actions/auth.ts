'use server';

import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';
import { zielFuerRolle } from '../utils/roles';
import { authFehler } from '../utils/authFehler';

export async function getEmails() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user').select('email').is('user_id', null);
  if (error) throw new Error(error.message);
  return data.map((u) => u.email);
}

export async function inviteSignUp(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` },
  });

  if (error) return { error: error.message };
  if (!data.session) return { needsConfirmation: true };

  const { data: profil } = await supabase
    .from('user')
    .insert({ setup_complete: true })
    .select('rolle')
    .eq('user_id', data.user!.id)
    .maybeSingle();

  return { ziel: profil?.rolle === 'agency' ? '/agentur' : '/admin' };
}

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login error:', error);
    return { error: error.message };
  }

  const { data: userData } = await supabase
    .from('user')
    .select('rolle')
    .eq('user_id', data.user.id)
    .maybeSingle();

  return { ziel: zielFuerRolle(userData?.rolle) };
}

export async function resetPassword(email: string) {
  const supabase = await createClient();

  console.log('Reset URL:', `${process.env.NEXT_PUBLIC_BASE_URL}/passwort-zuruecksetzen`);

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/passwort-zuruecksetzen`,
  });

  if (error) throw new Error(error.message);
  return data;
}

export async function signUp(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('SignUp error:', error);
    return { error: authFehler(error) };
  }

  // E-Mail-Bestätigung aktiv → noch keine Session, User muss Mail bestätigen
  if (!data.session) {
    return { needsConfirmation: true };
  }

  redirect('/onboarding');
}

export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('SignUp error:', error);
    return { error: authFehler(error) };
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
