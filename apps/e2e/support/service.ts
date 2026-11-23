import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { stack } from './stack'

/** Everything a test creates carries this, so the next run can find and remove it. */
const marker = 'e2e'

const domain = 'e2e.test'

let client: SupabaseClient | undefined

// Built on first use: the global setup imports this before it has read the key.
const service = () => {
  const secretKey = process.env.E2E_SUPABASE_SECRET_KEY

  if (secretKey === undefined) throw new Error('No secret key: the global setup reads it')

  client ??= createClient(stack.supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  return client
}

export type Person = { id: string; name: string; email: string; password: string }

const password = 'password123'

const uniqueId = () => `${marker}${crypto.randomUUID().slice(0, 8)}`

/** An address nobody has signed up with: a draw takes it as a pending participant. */
export const addressOf = (label: string) => `${label}-${uniqueId()}@${domain}`

/** A draw name the cleanup recognises. */
export const drawNameOf = (label: string) => `${label} ${uniqueId()}`

/**
 * A fresh account signing in with a password. An admin is also marked as signed in with Google,
 * since only a Google sign-in counts for the admin check.
 */
export const createPerson = async (
  firstName: string,
  { admin = false }: { admin?: boolean } = {},
): Promise<Person> => {
  const name = `${firstName} ${uniqueId().slice(marker.length)}`
  const email = addressOf(firstName.toLowerCase())

  const { data, error } = await service().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
    app_metadata: admin ? { providers: ['email', 'google'] } : {},
  })

  if (error) throw error

  if (admin) {
    const { error: adminError } = await service().from('admins').insert({ email })

    if (adminError) throw adminError
  }

  return { id: data.user.id, name, email, password }
}

/** Today in Poland, shifted by whole days: event days are counted in Warsaw time. */
export const warsawDateOf = (offsetDays = 0) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw' }).format(
    new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000),
  )

/** Moves a draw's event day, which the app offers no way to do for a draw already drawn. */
export const setEventDate = async (drawId: string, eventDate: string) => {
  const { error } = await service().from('draws').update({ event_date: eventDate }).eq('id', drawId)

  if (error) throw error
}

/** Removes what the suite creates: its accounts, admin entries and draws. */
export const removeLeftovers = async () => {
  const { data: draws, error } = await service().from('draws').select('id, name')

  if (error) throw error

  const drawIds = draws
    .filter(({ name }) => new RegExp(` ${marker}[0-9a-f]{8}$`).test(name))
    .map(({ id }) => id)

  if (drawIds.length > 0) await service().from('draws').delete().in('id', drawIds)

  await service().from('admins').delete().like('email', `%@${domain}`)

  const { data, error: listError } = await service().auth.admin.listUsers({ perPage: 10000 })

  if (listError) throw listError

  const leftovers = data.users.filter(({ email }) => email?.endsWith(`@${domain}`))
  const results = await Promise.all(leftovers.map(({ id }) => service().auth.admin.deleteUser(id)))
  const failed = results.find(({ error: deleteError }) => deleteError !== null)

  if (failed?.error) throw failed.error
}
