'use server';

import { Projekt } from '@/app/types/project';
import { createClient } from '@/app/utils/supabase/server';

export async function createProject(payload: Partial<Projekt>): Promise<Projekt> {
  const supabase = await createClient();
  const { data } = await supabase.from('projekt').insert(payload).select().single();
  return data;
}

export async function fetchProjects(id: number): Promise<Projekt[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('projekt').select().eq('team', id);
  return data || [];
}
