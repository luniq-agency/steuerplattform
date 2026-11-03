// Welche Bereiche darf welche Rolle betreten
const BEREICHE: Record<string, string[]> = {
  admin: ['/admin'],
  partner: ['/admin'],
  agency: ['/agentur'],
  client: ['/dashboard'],
};

const GESCHUETZT = ['/admin', '/agentur', '/dashboard'];

export function zielFuerRolle(rolle?: string | null): string {
  switch (rolle) {
    case 'admin':
    case 'partner':
      return '/admin';
    case 'agency':
      return '/agentur';
    case 'client':
      return '/dashboard';
    default:
      return '/onboarding';
  }
}

/** Gibt das Weiterleitungsziel zurück, oder null, wenn der Pfad erlaubt ist. */
export function rollenWeiterleitung(pfad: string, rolle?: string | null): string | null {
  const bereich = GESCHUETZT.find((b) => pfad === b || pfad.startsWith(`${b}/`));
  if (!bereich) return null; // öffentliche Seiten, Login, Onboarding usw.

  const erlaubt = BEREICHE[rolle ?? ''] ?? [];
  return erlaubt.includes(bereich) ? null : zielFuerRolle(rolle);
}