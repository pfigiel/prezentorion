import { Hono } from 'hono'
import { z } from 'zod'
import { requireUser, type UserEnv } from '../auth'
import { databaseOf, httpErrorOf } from '../database'
import { idParams, jsonBody } from '../validation'
import { itemSchema } from './schemas'

const itemParams = idParams(z.object({ itemId: z.uuid() }))

const rowOf = ({ photoPath, ...item }: z.infer<typeof itemSchema>) => ({
  ...item,
  photo_path: photoPath,
})

export const wishlist = new Hono<UserEnv>()
  .use(requireUser)
  .get('/', async (context) => {
    const { data, error } = await databaseOf(context).rpc('my_wishlist')

    if (error) throw httpErrorOf(error)

    return context.json(
      data.map(({ photo_path, is_purchased, ...item }) => ({
        ...item,
        photoPath: photo_path,
        isPurchased: is_purchased,
      })),
    )
  })
  .post('/', jsonBody(itemSchema), async (context) => {
    const { data, error } = await databaseOf(context)
      .from('wish_items')
      .insert(rowOf(context.req.valid('json')))
      .select('id')
      .single()

    if (error) throw httpErrorOf(error)

    return context.json({ id: data.id }, 201)
  })
  .put('/:itemId', itemParams, jsonBody(itemSchema), async (context) => {
    const { data, error } = await databaseOf(context)
      .from('wish_items')
      .update(rowOf(context.req.valid('json')))
      .eq('id', context.req.valid('param').itemId)
      .select('id')

    if (error) throw httpErrorOf(error)
    if (data.length === 0) return context.json({ error: 'Not found' }, 404)

    return context.body(null, 204)
  })
  .delete('/:itemId', itemParams, async (context) => {
    const { error } = await databaseOf(context)
      .from('wish_items')
      .delete()
      .eq('id', context.req.valid('param').itemId)

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
  .post('/:itemId/available', itemParams, async (context) => {
    const { error } = await databaseOf(context).rpc('mark_available', {
      item_id: context.req.valid('param').itemId,
    })

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
