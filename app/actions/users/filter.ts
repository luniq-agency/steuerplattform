import { User } from '@/app/types/Database';

export function filterAdmins(users: User[]) {
  const filteredUsers = users
    .filter((a) => a.rolle === 'admin')
    .map((a) => ({
      ...a,
      fullName: `${a.nachname}, ${a.vorname}`,
    }))
    .sort((a: User, b: User) => a.nachname.localeCompare(b.nachname));

  return filteredUsers;
}

export function filterClients(users: User[], id: string) {
  const filteredUsers = users
    .filter((a) => a.rolle === 'client' && a.bearbeiter === id)
    .map((a) => ({
      ...a,
      fullName: `${a.nachname}, ${a.vorname}`,
    }))
    .sort((a: User, b: User) => a.nachname.localeCompare(b.nachname));

  return filteredUsers;
}

export function filterClientsAll(users: User[]) {
  const filteredUsers = users
    .filter((a) => a.rolle === 'client')
    .map((a) => ({
      ...a,
      fullName: `${a.nachname}, ${a.vorname}`,
    }))
    .sort((a: User, b: User) => a.nachname.localeCompare(b.nachname));

  return filteredUsers;
}

export function filterClientsSelfEmployed(users: User[], id: string) {
  const filteredUsers = users
    .filter((a) => a.rolle === 'client' && a.bearbeiter === id)
    .map((a) => ({
      ...a,
      fullName: `${a.nachname}, ${a.vorname}`,
    }))
    .sort((a: User, b: User) => a.nachname.localeCompare(b.nachname));

  return filteredUsers;
}