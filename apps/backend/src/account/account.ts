import { Hono } from 'hono'
import { requireUser, type UserEnv } from '../auth'
import { databaseOf, httpErrorOf } from '../database'

export const account = new Hono<UserEnv>().use(requireUser).get('/', async (context) => {
  const { sub } = context.get('jwtPayload')
  const database = databaseOf(context)

  const [profile, isAdmin] = await Promise.all([
    database.from('profiles').select('id, email, name, picture_url').eq('id', sub).single(),
    database.rpc('is_admin'),
  ])

  if (profile.error) throw httpErrorOf(profile.error)
  if (isAdmin.error) throw httpErrorOf(isAdmin.error)

  return context.json({
    id: profile.data.id,
    email: profile.data.email,
    name: profile.data.name,
    pictureUrl: profile.data.picture_url,
    isAdmin: isAdmin.data,
  })
})
