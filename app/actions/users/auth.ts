'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { userUpdate } from '../users';

const getServiceClient = () =>
  createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function changeUserEmail(id: string, email: string) {
  const supabase = getServiceClient();

  const { data: user, error: userError } = await supabase
    .from('user')
    .select('user_id')
    .eq('id', id)
    .single();

  if (userError) {
    console.error('User lookup error:', userError);
    throw new Error(userError.message);
  }

  await userUpdate({ email: email }, id);

  if (!user?.user_id) {
    throw new Error('Kein user_id gefunden für diesen User');
  }

  const { data, error } = await supabase.auth.admin.updateUserById(user.user_id, {
    email,
  });

  if (error) {
    console.error('Supabase Admin updateUserById error:', error); // ← genaue Ursache
    throw new Error(error.message);
  }

  return data;
}
