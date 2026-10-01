'use server';

import { createClient } from '@/app/utils/supabase/server';
import { DocumentFolder } from '../types/Database';

export async function folderCreate(data: Partial<DocumentFolder>) {
  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from('document_folder')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return created;
}

export async function folderDelete(id: string) {
  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from('document_folder')
    .delete()
    .eq('id', id)
    .single();

  /*
  const { data: children, error: childrenError } = await supabase
    .from('document')
    .update({ parent: null })
    .eq('parent', id);
    */
  if (error) throw new Error(error.message);
  return created;
}

export async function foldersLoadUser(id: string) {
  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from('document_folder')
    .select('*')
    .eq('user', id);

  if (error) throw new Error(error.message);
  return created || [];
}

export async function folderUpdate(id: string, data: Partial<DocumentFolder>) {
  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from('document_folder')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created;
}
