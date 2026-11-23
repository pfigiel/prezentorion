import { apiAs } from './api'
import { drawNameOf, warsawDateOf, type Person } from './service'

type DrawOptions = {
  label?: string
  eventDate?: string
  budget?: number | null
  mode?: 'secret' | 'open'
  /** Pairs of participants who must not draw each other. */
  excludedPairs?: [Person, Person][]
  /** Run the draw straight away, or for an open draw, start it. */
  drawn?: boolean
}

export type Draw = { id: string; name: string }

/** A draw the admin creates through the API; people or bare addresses take part. */
export const createDraw = async (
  admin: Person,
  participants: (Person | string)[],
  {
    label = 'Wigilia',
    eventDate = warsawDateOf(30),
    budget = 150,
    mode = 'secret',
    excludedPairs = [],
    drawn = false,
  }: DrawOptions = {},
): Promise<Draw> => {
  const name = drawNameOf(label)
  const emails = participants.map((participant) =>
    typeof participant === 'string' ? participant : participant.email,
  )
  const { id } = await apiAs<{ id: string }>(admin, 'POST', '/admin/draws', {
    name,
    eventDate,
    budget,
    mode,
    emails,
    excludedPairs: excludedPairs.map((pair) => pair.map(({ email }) => email)),
  })

  if (drawn) await apiAs(admin, 'POST', `/admin/draws/${id}/run`)

  return { id, name }
}

export const reveal = (giver: Person, draw: Draw) =>
  apiAs(giver, 'POST', `/draws/${draw.id}/reveal`)

type ItemOptions = {
  url?: string | null
  price?: number | null
  priority?: number
  repeatable?: boolean
}

export const addItem = async (
  owner: Person,
  name: string,
  { url = null, price = null, priority = 2, repeatable = false }: ItemOptions = {},
) => {
  const { id } = await apiAs<{ id: string }>(owner, 'POST', '/wishlist', {
    name,
    url,
    price,
    note: null,
    priority,
    photoPath: null,
    repeatable,
  })

  return id
}

export const buy = (giver: Person, draw: Draw, itemId: string) =>
  apiAs(giver, 'PUT', `/draws/${draw.id}/purchases/${itemId}`, { purchased: true })

type Participant = { id: string; email: string }

/** A participant's id in a draw, which the paths of an open draw name them by. */
export const participantOf = async (viewer: Person, draw: Draw, person: Person) => {
  const { participants } = await apiAs<{ participants: Participant[] }>(
    viewer,
    'GET',
    `/draws/${draw.id}`,
  )
  const participant = participants.find(({ email }) => email === person.email)

  if (participant === undefined) throw new Error(`${person.email} takes no part in ${draw.name}`)

  return participant.id
}

type Assignment = { giver: { email: string }; recipient: { email: string } }

export const assignmentsOf = (admin: Person, draw: Draw) =>
  apiAs<Assignment[]>(admin, 'GET', `/admin/draws/${draw.id}/assignments`)

/** Gives a manager the owner's list, as the owner does on their list's settings. */
export const addManager = (owner: Person, manager: Person) =>
  apiAs(owner, 'POST', '/managers', { email: manager.email })
