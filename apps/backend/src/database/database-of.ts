import { PostgrestClient } from '@supabase/postgrest-js'
import type { Context } from 'hono'
import { env } from 'hono/adapter'
import type { Database } from './schema'

type DatabaseEnv = { SUPABASE_URL: string; SUPABASE_PUBLISHABLE_KEYS: string }

/** Postgres through PostgREST as the request's user, so row level security decides what they reach. */
export const databaseOf = (context: Context) => {
  const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEYS } = env<DatabaseEnv>(context)
  const { default: apikey } = JSON.parse(SUPABASE_PUBLISHABLE_KEYS) as { default: string }

  const authorization = context.req.header('Authorization')

  // Without a user's token the request runs as anon, which only the health check does.
  return new PostgrestClient<Database>(`${SUPABASE_URL}/rest/v1`, {
    headers: authorization === undefined ? { apikey } : { apikey, Authorization: authorization },
  })
}
