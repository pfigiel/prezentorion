import { Hono } from 'hono'
import { databaseOf, httpErrorOf } from '../database'

// Touches the database too, so the keep-alive cron that calls it keeps the free project awake.
export const health = new Hono().get('/', async (context) => {
  const { error } = await databaseOf(context).rpc('ping')

  if (error) throw httpErrorOf(error)

  return context.json({ status: 'ok' })
})
