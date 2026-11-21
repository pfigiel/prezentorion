import type { User } from '@/admin/api/admin'

/** An address nobody has signed in with yet stays pending, with no name or picture to show. */
export const participantOf = (email: string, users: User[]) => {
  const user = users.find((candidate) => candidate.email === email && candidate.id !== null)

  return { email, name: user?.name ?? null, pictureUrl: user?.pictureUrl ?? null }
}
