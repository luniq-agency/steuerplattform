// app/utils/imageUpload.ts  ← kein 'use server'

export async function imageUpload(file: File, objectId: number, name: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('objectId', String(objectId));
  formData.append('name', name);

  const res = await fetch('/api/images', {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || 'Upload fehlgeschlagen');
  }

  return JSON.parse(text);
}
