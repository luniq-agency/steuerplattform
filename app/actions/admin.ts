'use server';

import { createClient } from '@/app/utils/supabase/server';
import { User } from '../types/Database';
import { sendEmail } from './email';

export async function adminCompleteAccount(email: string, password: string, role: string) {
  const supabase = await createClient();

  //SIGNUP
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  const userId = data.user?.id || '';

  //UPDATE
  const { data: updated, error: updateError } = await supabase
    .from('user')
    .update({ user_uuid: userId, status: 'approved' })
    .eq('email', email);
  if (updateError) throw new Error(updateError.message);

  if (role === 'agency') {
    const { data: agent, error: agentError } = await supabase
      .from('agent')
      .update({ status: 'active' })
      .select()
      .single();
  }

  return updated;
}

export async function adminInvite(
  data: Partial<User>,
): Promise<User> {
  const supabase = await createClient();
  const { data: created, error } = await supabase.from('user').insert(data).select().single();
  if (error) throw new Error(error.message);
  return created;
}

export async function adminLookUp(id: string): Promise<User> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('id', id).single();

  return data;
}

export async function adminsLoadAll(): Promise<User[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('user_role', 'admin');

  if (error) throw new Error(error.message);
  return data || [];
}
