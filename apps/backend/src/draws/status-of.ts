import type { DrawRow } from '../database'

type Status = 'waiting' | 'drawn' | 'finished'

const warsawDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' })

/** Finished once the event day is over, counted in Polish time like the database's `today()`. */
export const statusOf = ({
  drawn_at,
  event_date,
}: Pick<DrawRow, 'drawn_at' | 'event_date'>): Status => {
  if (drawn_at === null) return 'waiting'

  return event_date < warsawDate.format(new Date()) ? 'finished' : 'drawn'
}
