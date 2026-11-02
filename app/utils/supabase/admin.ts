import 'server-only';
import { createClient } from '@supabase/supabase-js';

// Umgeht RLS: nur in Server Actions und Server-Komponenten verwenden,
// und nur nach eigener Berechtigungsprüfung.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
