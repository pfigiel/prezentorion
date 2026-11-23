import { Hono } from 'hono'
import { z } from 'zod'
import { requireUser, type UserEnv } from '../auth'
import { databaseOf, httpErrorOf } from '../database'
import { idParams, jsonBody } from '../validation'

const managerParams = idParams(z.object({ managerId: z.uuid() }))
const ownerParams = idParams(z.object({ ownerId: z.uuid() }))
const itemParams = idParams(z.object({ ownerId: z.uuid(), itemId: z.uuid() }))

const managerSchema = z.object({ email: z.email().trim().toLowerCase() })

const purchaseSchema = z.object({ purchased: z.boolean(), drawId: z.uuid().nullable() })

/** An owner names who manages their list; a manager sees the lists they were given. */
export const managers = new Hono<UserEnv>()
  .use(requireUser)
  .get('/', async (context) => {
    const { data, error } = await databaseOf(context)
      .from('list_managers')
      .select('id, email')
      .order('created_at')

    if (error) throw httpErrorOf(error)

    return context.json(data)
  })
  .post('/', jsonBody(managerSchema), async (context) => {
    const { email } = context.req.valid('json')

    if (email === context.get('jwtPayload').email.toLowerCase()) {
      return context.json({ error: 'Your own list is already yours' }, 400)
    }

    const { data, error } = await databaseOf(context)
      .from('list_managers')
      .insert({ email })
      .select('id')
      .single()

    if (error) throw httpErrorOf(error)

    return context.json({ id: data.id }, 201)
  })
  .delete('/:managerId', managerParams, async (context) => {
    const { error } = await databaseOf(context)
      .from('list_managers')
      .delete()
      .eq('id', context.req.valid('param').managerId)

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
  .get('/lists', async (context) => {
    const { data, error } = await databaseOf(context).rpc('managed_lists')

    if (error) throw httpErrorOf(error)

    return context.json(
      data.map(({ picture_url, ...owner }) => ({ ...owner, pictureUrl: picture_url })),
    )
  })
  .get('/lists/:ownerId', ownerParams, async (context) => {
    const { ownerId } = context.req.valid('param')
    const database = databaseOf(context)

    const [lists, draws, items] = await Promise.all([
      database.rpc('managed_lists'),
      database.rpc('managed_draws', { owner_id: ownerId }),
      database.rpc('managed_wishlist', { owner_id: ownerId }),
    ])

    if (lists.error) throw httpErrorOf(lists.error)
    if (draws.error) throw httpErrorOf(draws.error)
    if (items.error) throw httpErrorOf(items.error)

    const owner = lists.data.find(({ id }) => id === ownerId)

    if (!owner) return context.json({ error: 'Not found' }, 404)

    return context.json({
      owner: { id: owner.id, name: owner.name, pictureUrl: owner.picture_url },
      draws: draws.data.map(({ event_date, ...draw }) => ({ ...draw, eventDate: event_date })),
      items: items.data.map(({ photo_path, purchased_by, ...item }) => ({
        ...item,
        photoPath: photo_path,
        purchasedBy: purchased_by,
      })),
    })
  })
  .put(
    '/lists/:ownerId/purchases/:itemId',
    itemParams,
    jsonBody(purchaseSchema),
    async (context) => {
      const { purchased, drawId } = context.req.valid('json')
      const { error } = await databaseOf(context).rpc('set_managed_purchase', {
        item_id: context.req.valid('param').itemId,
        draw_id: drawId,
        purchased,
      })

      if (error) throw httpErrorOf(error)

      return context.body(null, 204)
    },
  )
