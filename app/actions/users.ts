'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Task, TaskUpdate, User } from '../types/Database';

export async function usersLoadAgentsAdmins(): Promise<User[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user')
    .select('*')
    .in('user_role', ['admin', 'agency']);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function usersLoadAll(): Promise<User[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function userCreate(userData: Partial<User>) {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').insert(userData).select().single();
  if (error) throw new Error(error.message);

  return data;
}

export async function userLookup(id: string): Promise<User> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('user').select('*').eq('id', id).single();
  return data;
}

export async function userLookupWithId(id: string): Promise<User> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('user_uuid', id).single();
  if (error) throw new Error(error.message);

  return data;
}
export async function userUpdate(userData: Partial<User>, id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user')
    .update(userData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);

  return data;
}
