import type { ParticipantRow, ProfileRow } from '../database'

type Row = Pick<ParticipantRow, 'id' | 'email'> & {
  profile: Pick<ProfileRow, 'name' | 'picture_url'> | null
}

/** A participant still waiting for their first sign-in is known only by their address. */
export const personOf = ({ id, email, profile }: Row) => ({
  id,
  email,
  name: profile?.name ?? null,
  pictureUrl: profile?.picture_url ?? null,
})
