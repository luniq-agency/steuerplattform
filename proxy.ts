import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Welche Rolle wohin gehört
function zielFuerRolle(rolle?: string | null): string {
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

const PROTECTED_ROUTES = ['/admin', '/agentur', '/dashboard'];
const EXCLUDED_ROUTES = ['/admin/konto-erstellen'];
const AUTH_PAGES = ['/', '/login', '/signup'];

const imBereich = (pfad: string, bereich: string) => pfad === bereich || pfad.startsWith(`${bereich}/`);

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pfad = request.nextUrl.pathname;

  // Weiterleitung, die erneuerte Session-Cookies mitnimmt
  const weiterleiten = (ziel: string) => {
    const redirect = NextResponse.redirect(new URL(ziel, request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  const isExcluded = EXCLUDED_ROUTES.some((r) => imBereich(pfad, r));
  const bereich = isExcluded ? undefined : PROTECTED_ROUTES.find((r) => imBereich(pfad, r));
  const isAuthPage = AUTH_PAGES.includes(pfad);

  // Nichts zu prüfen
  if (!bereich && !isAuthPage) return response;

  // Geschützter Bereich ohne Login → Startseite (Login)
  if (bereich && !user) return weiterleiten('/');

  // Nicht eingeloggt auf Login-Seite → normal anzeigen
  if (!user) return response;

  // Rolle laden
  const { data: profil } = await supabase
    .from('user')
    .select('rolle')
    .eq('user_id', user.id)
    .maybeSingle();

  const ziel = zielFuerRolle(profil?.rolle);

  // Eingeloggt auf Login-Seite → in den eigenen Bereich
  if (isAuthPage) return weiterleiten(ziel);

  // Falscher Bereich → in den eigenen Bereich
  if (bereich && !imBereich(ziel, bereich)) return weiterleiten(ziel);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons|bilder|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)'],
};