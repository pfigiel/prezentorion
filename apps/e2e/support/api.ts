import type { Person } from './service'
import { apiUrl, stack } from './stack'

export const tokenOf = async ({ email, password }: Pick<Person, 'email' | 'password'>) => {
  const response = await fetch(`${stack.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: stack.publishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) throw new Error(`Signing in ${email} failed with ${response.status}`)

  return ((await response.json()) as { access_token: string }).access_token
}

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** The app's API as this person, for setting a scene up; returns the raw response. */
export const callAs = async (person: Person | null, method: Method, path: string, body?: unknown) =>
  fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      ...(person === null ? {} : { Authorization: `Bearer ${await tokenOf(person)}` }),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

/** Like `callAs`, but expects success and parses what comes back. */
export const apiAs = async <Body = void>(
  person: Person,
  method: Method,
  path: string,
  body?: unknown,
): Promise<Body> => {
  const response = await callAs(person, method, path, body)

  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}: ${await response.text()}`)
  }

  return (response.status === 204 ? undefined : await response.json()) as Body
}

/** PostgREST directly as this person, skipping the API, as anyone holding their token could. */
export const restAs = async (person: Person, path: string, init: RequestInit = {}) =>
  fetch(`${stack.supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: stack.publishableKey,
      Authorization: `Bearer ${await tokenOf(person)}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
