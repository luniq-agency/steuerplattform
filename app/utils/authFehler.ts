import type { AuthError } from '@supabase/supabase-js';

const NACH_CODE: Record<string, string> = {
  user_already_exists: 'Für diese E-Mail-Adresse gibt es bereits ein Konto.',
  email_exists: 'Für diese E-Mail-Adresse gibt es bereits ein Konto.',
  invalid_credentials: 'E-Mail-Adresse oder Passwort ist falsch.',
  email_not_confirmed: 'Bitte bestätige zuerst deine E-Mail-Adresse über den Link in unserer E-Mail.',
  weak_password: 'Das Passwort ist zu schwach. Bitte wähle ein längeres Passwort mit Buchstaben, Zahlen und Sonderzeichen.',
  same_password: 'Das neue Passwort muss sich vom bisherigen unterscheiden.',
  email_address_invalid: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  validation_failed: 'Bitte prüfe deine Eingaben.',
  signup_disabled: 'Die Registrierung ist derzeit nicht möglich.',
  email_provider_disabled: 'Die Anmeldung per E-Mail ist derzeit nicht möglich.',
  over_email_send_rate_limit: 'Es wurden zu viele E-Mails angefordert. Bitte warte einen Moment und versuche es erneut.',
  over_request_rate_limit: 'Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.',
  user_not_found: 'Zu dieser E-Mail-Adresse wurde kein Konto gefunden.',
  user_banned: 'Dieses Konto ist gesperrt. Bitte wende dich an den Support.',
  session_expired: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  otp_expired: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.',
};

// Rückfall, falls kein Code mitkommt
const NACH_TEXT: [RegExp, string][] = [
  [/already registered|already exists/i, NACH_CODE.user_already_exists],
  [/invalid login credentials/i, NACH_CODE.invalid_credentials],
  [/email not confirmed/i, NACH_CODE.email_not_confirmed],
  [/password should be at least/i, 'Das Passwort ist zu kurz.'],
  [/rate limit|too many/i, NACH_CODE.over_request_rate_limit],
  [/invalid.*email|email.*invalid/i, NACH_CODE.email_address_invalid],
];

export function authFehler(error: Pick<AuthError, 'message' | 'code'> | null | undefined): string {
  if (!error) return '';
  if (error.code && NACH_CODE[error.code]) return NACH_CODE[error.code];
  const treffer = NACH_TEXT.find(([muster]) => muster.test(error.message));
  return treffer ? treffer[1] : 'Etwas ist schiefgelaufen. Bitte versuche es erneut.';
}