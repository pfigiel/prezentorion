import { createMiddleware } from 'hono/factory'
import type { UserEnv } from '../auth'
import { databaseOf, httpErrorOf } from '../database'

/** The SQL functions check again; this only turns a non-admin away before any of them runs. */
export const requireAdmin = createMiddleware<UserEnv>(async (context, next) => {
  const { data, error } = await databaseOf(context).rpc('is_admin')

  if (error) throw httpErrorOf(error)
  if (!data) return context.json({ error: 'Forbidden' }, 403)

  await next()
})
