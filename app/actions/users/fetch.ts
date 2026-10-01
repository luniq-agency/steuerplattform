'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { userUpdate } from '../users';
import { User } from '@/app/types/Database';

const getServiceClient = () =>
  createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function fetchUsersParter(): Promise<User[]> {
  const supabase = getServiceClient();
  const { data } = await supabase
    .from('user')
    .select('*')
    .eq('user_role', 'client')
    .eq('job_status', 'self-employed');
  return data || [];
}
