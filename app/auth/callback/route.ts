import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    console.error('Callback ohne Code aufgerufen:', request.url);
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const { data: profile } = await supabase
    .from('user')
    .select('rolle')
    .eq('user_id', data.user.id)
    .maybeSingle();

  let target = '/onboarding';
  switch (profile?.rolle) {
    case 'admin':
    case 'partner':
      target = '/admin';
      break;
    case 'agency':
      target = '/agentur';
      break;
    case 'client':
      target = '/dashboard';
      break;
  }

  return NextResponse.redirect(`${origin}${target}`);
}
