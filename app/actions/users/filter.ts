import { User } from '@/app/types/Database';

export function filterAdmins(users: User[]) {
  const filteredUsers = users
    .filter((a) => a.user_role === 'admin')
    .map((a) => ({
      ...a,
      fullName: `${a.user_name_last}, ${a.user_name_first}`,
    }))
    .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last));

  return filteredUsers;
}

export function filterClients(users: User[], id: string) {
  const filteredUsers = users
    .filter((a) => a.user_role === 'client' && a.bearbeiter === id)
    .map((a) => ({
      ...a,
      fullName: `${a.user_name_last}, ${a.user_name_first}`,
    }))
    .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last));

  return filteredUsers;
}

export function filterClientsAll(users: User[]) {
  const filteredUsers = users
    .filter((a) => a.user_role === 'client')
    .map((a) => ({
      ...a,
      fullName: `${a.user_name_last}, ${a.user_name_first}`,
    }))
    .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last));

  return filteredUsers;
}

export function filterClientsSelfEmployed(users: User[], id: string) {
  const filteredUsers = users
    .filter((a) => a.user_role === 'client' && a.bearbeiter === id)
    .map((a) => ({
      ...a,
      fullName: `${a.user_name_last}, ${a.user_name_first}`,
    }))
    .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last));

  return filteredUsers;
}