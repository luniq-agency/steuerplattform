'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Agent, User } from '../types/Database';
import { sendEmail } from './email';

export async function agencyCreate(data: Partial<Agent>) {
  const supabase = await createClient();

  if (!data) return;

  //AGENCY ACCOUNT
  const { data: created, error } = await supabase.from('user').insert(data).select().single();
  if (error) throw new Error(error.message);

  //EMAIL
  try {
    await sendEmail('agentur-einladung', created.email, {
      name: data.vorname,
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/admin/konto-erstellen/${created.id}`,
    });
  } catch (err) {
    console.error('Email Fehler:', err);
    throw err;
  }

  return created;
}

export async function agencyLoad(id: string): Promise<User> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);

  return data;
}



export async function agencyLoadAll(): Promise<User[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('user_role', 'agency');

  if (error) throw new Error(error.message);
  return data;
}

export async function agencyLookup(id: string): Promise<Agent> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);

  return data;
}

export async function agencySignup(email: string, id: string, password: string) {
  const supabase = await createClient();

  if (!email) return;

  //SIGNUP
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  const userId = data.user?.id || '';

  //USER ACCOUNT
  const { data: userData, error: userError } = await supabase
    .from('user')
    .update({ user_uuid: userId })
    .eq('id', id)
    .single();
  if (userError) throw new Error(userError.message);

  return userData;
}
