import { getSession } from './session'

type Options = {
  method: 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

export const fetchApi = async <Body = void>(path: string, options?: Options): Promise<Body> => {
  const session = await getSession()

  if (session === null) throw new Error(`${path} needs a signed-in user`)

  const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    method: options?.method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(options?.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
  })

  if (!response.ok) throw new Error(`${path} failed with ${response.status}`)

  // The API answers a change with 204 and nothing to parse.
  return (response.status === 204 ? undefined : await response.json()) as Body
}
