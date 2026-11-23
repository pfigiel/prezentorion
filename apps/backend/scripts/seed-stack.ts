// Gives the local stack accounts to sign in with by password, each with a wish list and the admin
// managing Anna's, so `pnpm dev:local` can be tried as an admin, as the people taking part and as a
// list manager. Running it again leaves existing accounts alone and fills a list only while it is
// empty, so nothing edited is undone; a manager taken off Anna's list comes back.
import { execFileSync } from 'node:child_process'

const status = execFileSync('pnpm', ['exec', 'supabase', 'status', '--output', 'json'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: ['ignore', 'pipe', 'pipe'],
})
const { API_URL: url, SECRET_KEY: secretKey } = JSON.parse(status.toString()) as {
  API_URL: string
  SECRET_KEY: string
}

const password = 'password123'

type Item = {
  name: string
  url?: string
  price?: number
  note?: string
  priority?: 1 | 2 | 3
  repeatable?: boolean
}

// Prices run past 150 zł, so a draw with a budget around that hides some of each list.
type Person = {
  email: string
  name: string
  admin: boolean
  wishlist: Item[]
  /** Who may see this list as a giver would and mark purchases on it. */
  managers?: string[]
}

const people: Person[] = [
  {
    email: 'admin@local.test',
    name: 'Admin',
    admin: true,
    wishlist: [
      { name: 'Kubek termiczny', price: 89, priority: 3, url: 'https://example.com/kubek' },
      { name: 'Książka „Hobbit”', price: 45, note: 'Najlepiej w twardej oprawie.' },
      { name: 'Słuchawki bezprzewodowe', price: 349, priority: 1 },
    ],
  },
  {
    email: 'anna@local.test',
    name: 'Anna',
    admin: false,
    managers: ['admin@local.test'],
    wishlist: [
      {
        name: 'Szalik z wełny merino',
        price: 120,
        priority: 3,
        note: 'Najchętniej butelkowa zieleń.',
      },
      { name: 'Zestaw herbat', price: 60, url: 'https://example.com/herbaty', repeatable: true },
      { name: 'Świeca zapachowa', price: 40, priority: 1 },
      { name: 'Czytnik e-booków', price: 549, priority: 2 },
    ],
  },
  {
    email: 'bartek@local.test',
    name: 'Bartek',
    admin: false,
    wishlist: [
      { name: 'Rękawiczki rowerowe', price: 79, priority: 3, note: 'Rozmiar L.' },
      { name: 'Gra planszowa „Wsiąść do pociągu”', price: 189, url: 'https://example.com/gra' },
      { name: 'Skarpetki w renifery', priority: 1, repeatable: true },
    ],
  },
  {
    email: 'celina@local.test',
    name: 'Celina',
    admin: false,
    wishlist: [
      { name: 'Album o sztuce japońskiej', price: 140, priority: 3 },
      { name: 'Roślina doniczkowa', price: 55, note: 'Coś, czego nie da się zabić.' },
      { name: 'Voucher na masaż', price: 200, priority: 2 },
    ],
  },
]

const service = (path: string, init: { method?: string; body?: unknown; prefer?: string } = {}) =>
  fetch(`${url}${path}`, {
    method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
    headers: {
      apikey: secretKey,
      'Content-Type': 'application/json',
      ...(init.prefer === undefined ? {} : { Prefer: init.prefer }),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  })

const rowsOf = async <Row>(path: string) => {
  const response = await service(path)

  if (!response.ok) throw new Error(`Reading ${path} failed with ${response.status}`)

  return (await response.json()) as Row[]
}

for (const { email, name, admin, wishlist, managers = [] } of people) {
  const created = await service('/auth/v1/admin/users', {
    body: {
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: name },
      // Only a Google sign-in counts for the admin check, and the local stack has no Google.
      app_metadata: admin ? { providers: ['email', 'google'] } : {},
    },
  })

  if (!created.ok && created.status !== 422) {
    throw new Error(`Creating ${email} failed with ${created.status}: ${await created.text()}`)
  }

  if (admin) {
    const listed = await service('/rest/v1/admins', {
      body: { email },
      prefer: 'resolution=ignore-duplicates',
    })

    if (!listed.ok) throw new Error(`Making ${email} an admin failed with ${listed.status}`)
  }

  const [profile] = await rowsOf<{ id: string }>(`/rest/v1/profiles?select=id&email=eq.${email}`)

  if (profile === undefined) throw new Error(`${email} has no profile`)

  const existing = await rowsOf(`/rest/v1/wish_items?select=id&owner_id=eq.${profile.id}&limit=1`)

  if (managers.length > 0) {
    const managed = await service('/rest/v1/list_managers?on_conflict=owner_id,email', {
      body: managers.map((manager) => ({ owner_id: profile.id, email: manager })),
      prefer: 'resolution=ignore-duplicates',
    })

    if (!managed.ok)
      throw new Error(`Giving ${email}'s list a manager failed with ${managed.status}`)
  }

  if (existing.length > 0) continue

  const added = await service('/rest/v1/wish_items', {
    body: wishlist.map((item) => ({
      owner_id: profile.id,
      name: item.name,
      url: item.url ?? null,
      price: item.price ?? null,
      note: item.note ?? null,
      priority: item.priority ?? 2,
      repeatable: item.repeatable ?? false,
    })),
  })

  if (!added.ok) throw new Error(`Filling ${email}'s wish list failed with ${added.status}`)
}

console.log(`Sign in as ${people.map(({ email }) => email).join(', ')} with "${password}".`)
