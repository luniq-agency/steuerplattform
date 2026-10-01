'use server';

import { createClient } from '@/app/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { Document } from '../types/Database';
import { sanitizeFileName } from '../utils/sanitize';

const getServiceClient = () =>
  createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function documentCreate(data: Partial<Document>) {
  const supabase = await createClient();
  const { data: created, error } = await supabase.from('document').insert(data).select().single();
  if (error) throw new Error(error.message);
  return created;
}

export async function documentDelete(id: string) {
  const supabase = await createClient();
  const { data: deleted, error } = await supabase.from('document').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return deleted;
}

export async function documentLoad(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('document').select('*').eq('id', id).single();
  return data;
}

export async function documentUpdate(data: Partial<Document>, id: string) {
  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from('document')
    .update(data)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return updated;
}

export async function documentUpload(
  file: File,
  fileName: string,
  fileType: string,
  name: string,
  user: string | number,
  folderId?: string | null
) {
  const supabase = getServiceClient();

  const extension = file.type === 'application/pdf' ? 'pdf' : 'docx';
  const filePath = `${user}/${fileName}.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(filePath, buffer, { contentType: file.type });

  if (storageError) throw new Error(storageError.message);

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);

  const { data, error: dbError } = await supabase
    .from('document')
    .insert({
      document_name: name,
      document_file: urlData.publicUrl,
      file_type: fileType || null,
      folder: folderId ?? null,
      user,
    })
    .select()
    .single();

  if (dbError) throw new Error(dbError.message);
  return data;
}

export async function documentsLoadAll(): Promise<Document[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('document').select('*');
  if (error) throw new Error(error.message);
  return data || [];
}

export async function documentsLoadUser(id: string): Promise<Document[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('document').select('*').eq('user', id);
  if (error) throw new Error(error.message);
  return data || [];
}
