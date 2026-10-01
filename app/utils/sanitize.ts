export const sanitizeFileName = (name: string) => {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Sonderzeichen durch _ ersetzen
    .replace(/\s+/g, '_'); // Leerzeichen durch _ ersetzen
};

export function sanitizeInput(value: string):string {
  const trimmed = value.trimStart();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1); 
};

export function sanitizeInputFinal(value: string): string {
  const trimmed = value.trim(); // Leerzeichen am Anfang und Ende
  return trimmed.charAt(0)?.toUpperCase() + trimmed.slice(1);
}