'use server';

import { User } from '@/app/types/Database';
import { Teammitglied } from '@/app/types/teams';
import { createClient } from '@/app/utils/supabase/server';

// CREATE
export async function putTeamMember(payload: Partial<Teammitglied>) {
  const supabase = await createClient();
  const { data } = await supabase.from('teammitglied').insert(payload).select().single();
  return data;
}

// READ
export async function fetchTeamMembers(
  team: number
): Promise<{ members: Teammitglied[]; users: User[] }> {
  const supabase = await createClient();
  const leer = { members: [], users: [] };

  // TEAMMITGLIEDER
  const { data: members, error: membersError } = await supabase
    .from('teammitglied')
    .select('*')
    .eq('team', team)
    .order('rolle');

  if (membersError) {
    console.error('Teammitglieder konnten nicht geladen werden:', membersError);
    return leer;
  }

  if (!members?.length) return leer;

  // USERS
  const { data: users, error } = await supabase
    .from('user')
    .select()
    .in(
      'id',
      members.map((m) => m.user)
    );

  if (error) {
    console.error('Vorgänge konnten nicht geladen werden:', error);
    return { members, users: [] };
  }

  return { members, users };
}
