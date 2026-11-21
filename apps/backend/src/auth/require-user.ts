import { env } from 'hono/adapter'
import { jwk } from 'hono/jwk'
import type { JwtVariables } from 'hono/jwt'
import { signingKeysOf } from './signing-keys-of'

type Claims = { sub: string; email: string }

export type UserEnv = { Variables: JwtVariables<Claims> }

/** Rejects a request without a valid Supabase access token; the token's claims land in `jwtPayload`. */
export const requireUser = jwk({
  keys: (context) => signingKeysOf(env<{ SUPABASE_URL: string }>(context).SUPABASE_URL),
  alg: ['ES256'],
})
