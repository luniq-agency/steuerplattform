'use server';

import { Client, User } from '../types/Database';
import { createClient } from '@/app/utils/supabase/server';

export async function clientInvite(userData: Partial<User>) {
  const supabase = await createClient();

  //CLIENT
  const { data: user, error: clientError } = await supabase
    .from('user')
    .insert(userData)
    .select()
    .single();
  if (clientError) throw new Error(clientError.message);


  return user;
}

export async function clientSignup(email: string, password: string) {
  const supabase = await createClient();

  //REGISTRIEREN
  const { data: created, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);

  //ANMELDEN
  const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(signInError.message);

  return data;
}

export async function clientCreateProfile(data: Partial<User>, clientData: Partial<Client>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase.from('user').insert(data).select().single();
  const { data: client, error: clientError } = await supabase
    .from('client')
    .insert(clientData)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created;
}

export async function clientsLoadAll(role: string, agentId?: string): Promise<User[]> {
  const supabase = await createClient();

  let query = supabase.from('user').select('*').eq('user_role', 'client');

  if (role === 'agency') {
    if (!agentId) {
      throw new Error('agentId ist erforderlich, wenn role "agency" ist.');
    }
    query = query.eq('bearbeiter', agentId);
  } else if (role !== 'admin') {
    throw new Error(`Unbekannte Rolle: ${role}`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data;
}

export async function clientLoadSingle(id: string): Promise<Client> {
  const supabase = await createClient();

  const { data: created, error } = await supabase.from('client').select('*').eq('id', id).single();

  if (error) throw new Error(error.message);

  return created;
}

export async function clientsLoadAdmin(): Promise<User[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('user_role', 'client');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function clientsLoadAgency(id: string): Promise<User[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('bearbeiter', id);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function clientsLoadLatest(): Promise<Partial<User>[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user')
    .select('id, user_name_last, user_name_first, created_at')
    .range(0, 5);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function clientLookup(id: string): Promise<User> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('user').select('*').eq('id', id).single();

  if (error) throw new Error(error.message);

  return data;
}

export async function clientLookupFromUser(id: string): Promise<Client> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('client').select('*').eq('user', id).single();

  if (error) throw new Error(error.message);

  return data;
}

export async function clientUpdate(data: Partial<User>, id: string) {
  const supabase = await createClient();

  const { data: created, error } = await supabase.from('user').update(data).eq('id', id).select();

  if (error) throw new Error(error.message);

  return created;
}
