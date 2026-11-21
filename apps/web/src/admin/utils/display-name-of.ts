import type { Person } from '@/draws/api/draws'

/** Someone who has not signed in yet has no name, only the address they were added under. */
export const displayNameOf = ({ name, email }: Pick<Person, 'name' | 'email'>) => name ?? email
