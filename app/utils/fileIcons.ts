const ICONS: Record<string, string> = {
  pdf: 'pdf',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  heic: 'image',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  csv: 'excel',
  ppt: 'powerpoint',
  pptx: 'powerpoint',
  zip: 'zip',
  rar: 'zip',
  txt: 'text',
};

export const getExtension = (filename?: string | null) =>
  filename?.includes('.') ? filename.split('.').pop()!.toLowerCase() : '';

export const getFileIcon = (filename?: string | null) =>
  `/icons/${ICONS[getExtension(filename)] ?? 'file'}.svg`;

export const getFileTypeLabel = (filename?: string | null) => {
  const ext = getExtension(filename);
  return ext ? ext.toUpperCase() : 'Datei';
};
