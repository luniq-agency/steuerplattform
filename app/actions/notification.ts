'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Invoice, Notification, User } from '../types/Database';

export async function notificationCreate(data: Partial<Notification>, recipient: User) {
  const supabase = await createClient();

  if (recipient.permission_notifications_push === true) {
    const { data: created, error } = await supabase
      .from('notification')
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
    .from('notification')
    .delete()
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  return deleted;
}

export async function notificationsLoadUser(id: string): Promise<Notification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notification')
    .select('*')
    .eq('recipient', id)
    .eq('read', false);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function notificationsMarkAllRead(id: string): Promise<Notification[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('notification')
    .update({ read: true })
    .eq('recipient', id)
    .eq('read', false);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function notificationUpdate(data: Partial<Notification>, id: string) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('notification')
    .update(data)
    .eq('id', id)
    .select();

  if (error) throw new Error(error.message);

  return created;
}
