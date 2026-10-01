import { createClient } from '@/app/utils/supabase/client';

export const uploadFileDirectly = async (file: File, path: string) => {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
  return urlData.publicUrl;
};
