import { Hono } from 'hono'
import { requireUser, type UserEnv } from '../auth'
import { databaseOf, httpErrorOf } from '../database'

export const account = new Hono<UserEnv>()
  .use(requireUser)
  .get('/', async (context) => {
    const { sub } = context.get('jwtPayload')
    const database = databaseOf(context)

    const [profile, isAdmin] = await Promise.all([
      database
        .from('profiles')
        .select('id, email, name, picture_url, install_prompt_settled')
        .eq('id', sub)
        .single(),
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
      installPromptSettled: profile.data.install_prompt_settled,
    })
  })
  .post('/install-prompt/settle', async (context) => {
    const { error } = await databaseOf(context).rpc('settle_install_prompt')

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
