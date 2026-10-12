'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Benachrichtigung, User } from '../types/Database';

export async function notificationCreate(data: Partial<Benachrichtigung>, recipient: User) {
  const supabase = await createClient();

  if (recipient.permission_notifications_push === true) {
    const { data: created, error } = await supabase
      .from('benachrichtigung')
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return created;
  }
}

export async function notificationDelete(id: string) {
  const supabase = await createClient();

  const { data: deleted, error } = await supabase
    .from('benachrichtigung')
    .delete()
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  return deleted;
}

export async function notificationsLoadUser(id: string): Promise<Benachrichtigung[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('benachrichtigung')
    .select('*')
    .eq('user', id)
    .eq('gelesen', false);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function notificationsMarkAllRead(id: string): Promise<Benachrichtigung[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('benachrichtigung')
    .update({ read: true })
    .eq('user', id)
    .eq('gelesen', false);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function notificationUpdate(data: Partial<Benachrichtigung>, id: string) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('benachrichtigung')
    .update(data)
    .eq('id', id)
    .select();

  if (error) throw new Error(error.message);

  return created;
}
