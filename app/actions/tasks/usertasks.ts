'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Task, TaskUpdate, User } from '@/app/types/Database'

export async function tasksLoadUser(id: string) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('task')
    .update({ status: 'closed' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created;
}