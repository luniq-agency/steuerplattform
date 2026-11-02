'use server';

import { createClient } from '@/app/utils/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { Zertifikat } from '../types/certificates';

const getServiceClient = () =>
  createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function certificateCreate(
  file: File,
  id: string,
  data: Partial<Zertifikat>,
  year: string
) {
  const supabase = getServiceClient();
  const filePath = `${id}/${year}/${file.name}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: storageError } = await supabase.storage
    .from('uploads')
    .upload(filePath, buffer, { contentType: file.type, upsert: true });

  if (storageError) throw new Error(storageError.message);

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);

  const { data: created, error } = await supabase
    .from('zertifikat')
    .insert({ ...data, file: urlData.publicUrl })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function certificateDelete(id: string | number) {
  const supabase = getServiceClient();

  // Erst die Datei URL aus der DB holen
  const { data: certificate, error: fetchError } = await supabase
    .from('zertifikat')
    .select('file')
    .eq('id', id)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // Pfad aus URL extrahieren
  if (certificate?.file) {
    const path = certificate.file.split('/uploads/')[1]?.split('?')[0];
    if (path) {
      await supabase.storage.from('uploads').remove([path]);
    }
  }

  // Dann DB-Eintrag löschen
  const { data, error } = await supabase.from('zertifikat').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return data;
}

export async function certificatesLoadUser(id: number): Promise<Zertifikat[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('zertifikat').select('*').eq('user', id);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function certificateUpdate(id: string | number, data: Partial<Zertifikat>) {
  const supabase = await createClient();
  const { data: created, error } = await supabase
    .from('certificate')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return created;
}
