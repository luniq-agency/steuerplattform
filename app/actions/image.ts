'use server';

import { createClient } from '@/app/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { Document } from '../types/Database';

const getServiceClient = () =>
  createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function imageUpload(file: File, user: string) {
  const supabase = getServiceClient();

  const extension = file.type === 'png' ? 'jpg' : 'webp';
  const filePath = `${user}/profilbild.${extension}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(filePath, buffer, { contentType: file.type, upsert: true });

  if (storageError) throw new Error(storageError.message);

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);

  return `${urlData.publicUrl}?t=${Date.now()}`;
}

export async function imageUploadReplace(file: File, existingUrl: string, documentId: string) {
  const supabase = getServiceClient();

  let filePath: string;

  if (existingUrl.includes('/uploads/')) {
    // Bereits in Supabase
    const urlParts = existingUrl.split('/uploads/');
    filePath = urlParts[1].split('?')[0];
  } else {
    // Extern (Bubble etc.) – neuen Pfad erstellen
    const extension = existingUrl.split('.').pop()?.split('?')[0] || 'jpg';
    filePath = `documents/${documentId}/${Date.now()}.${extension}`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from('uploads')
    .upload(filePath, buffer, { contentType: file.type, upsert: true });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);

  // URL in DB aktualisieren
  await supabase.from('document').update({ document_file: urlData.publicUrl }).eq('id', documentId);

  return urlData.publicUrl;
}
