'use server';

import { createClient } from '@/app/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function getEmails() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user').select('email').is('user_id', null);
  if (error) throw new Error(error.message);
  return data.map((u) => u.email);
}

export async function login(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Login error:', error);
    return { error: error.message };
  }

  const { data: userData, error: roleError } = await supabase
    .from('user')
    .select('rolle')
    .eq('user_id', data.user.id)
    .maybeSingle();

  if (roleError) console.error('Role query error:', roleError);

  switch (userData?.rolle) {
    case 'admin':
    case 'agency':
    case 'partner':
      redirect('/admin');
    case 'client':
      redirect('/dashboard');
    default:
      redirect('/onboarding');
  }
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

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}
