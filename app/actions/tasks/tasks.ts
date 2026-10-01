'use server';

import { createClient } from '@/app/utils/supabase/server';
import { Task, TaskUpdate, User } from '@/app/types/Database';

export async function taskClose(id: string) {
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
export async function taskCreate(data: Partial<Task>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase.from('task').insert(data).select().single();

  if (error) throw new Error(error.message);

  return created;
}

export async function taskLoad(id: string): Promise<Task> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('task').select('*').eq('id', id).single();

  if (error) throw new Error(error.message);

  return data;
}

export async function tasksLoadAll(role: string, id: string): Promise<Task[]> {
  const supabase = await createClient();

  let query = supabase.from('task').select('*');

  if (role === 'agency') {
    if (!id) {
      throw new Error('agentId ist erforderlich, wenn role "agency" ist.');
    }
    query = query.eq('assignee', id);
  } else if (role !== 'admin') {
    throw new Error(`Unbekannte Rolle: ${role}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function tasksLoadOpen(role: string, id: string): Promise<Task[]> {
  const supabase = await createClient();

  let query = supabase.from('task').select('*').in('status', ['open', 'overdue']);

  if (role === 'agency') {
    if (!id) {
      throw new Error('agentId ist erforderlich, wenn role "agency" ist.');
    }
    query = query.eq('assignee', id);
  } else if (role !== 'admin') {
    throw new Error(`Unbekannte Rolle: ${role}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

export async function tasksLoadUser(id: string): Promise<Task[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('task').select('*').eq('user', id);

  if (error) throw new Error(error.message);

  return data || [];
}

export async function taskTransfer(id: string, target: string, user: string): Promise<Task> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task')
    .update({ assignee: target })
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function taskUpdate(taskData: Partial<Task>, id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('task')
    .update(taskData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function taskUpdateCreate(data: Partial<TaskUpdate>) {
  const supabase = await createClient();

  const { data: created, error } = await supabase
    .from('task_update')
    .insert(data)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return created;
}

export async function taskUpdatesLoad(id: string): Promise<TaskUpdate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from('task_update').select('*').eq('task', id);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function tasksOpenAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.from('task').select('*').in('status', ['overdue', 'open']);

  if (error) throw new Error(error.message);
  return data || [];
}

export async function tasksOpenAgency(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('task')
    .select('*')
    .in('status', ['overdue', 'open'])
    .eq('assignee', id);

  if (error) throw new Error(error.message);
  return data || [];
}
