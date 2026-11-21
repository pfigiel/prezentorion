import type { jwk } from 'hono/jwk'

type SigningKeys = Extract<NonNullable<Parameters<typeof jwk>[0]['keys']>, unknown[]>

const lifetimeMs = 10 * 60 * 1000

let cached: { keys: SigningKeys; expiresAt: number } | undefined

// Hono's own `jwks_uri` option fetches the keys again on every request.
export const signingKeysOf = async (supabaseUrl: string): Promise<SigningKeys> => {
  if (cached !== undefined && cached.expiresAt > Date.now()) {
    return cached.keys
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/.well-known/jwks.json`)

  if (!response.ok) {
    throw new Error(`Fetching the signing keys failed with ${response.status}`)
  }

  const { keys } = (await response.json()) as { keys: SigningKeys }
  cached = { keys, expiresAt: Date.now() + lifetimeMs }

  return keys
}
