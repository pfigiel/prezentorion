import { Hono } from 'hono'
import { z } from 'zod'
import { requireUser, type UserEnv } from '../auth'
import { databaseOf, httpErrorOf } from '../database'
import { personOf, statusOf } from '../draws'
import { idParams, jsonBody } from '../validation'
import { requireAdmin } from './require-admin'
import { drawSchema, passwordSchema } from './schemas'

const drawParams = idParams(z.object({ drawId: z.uuid() }))
const userParams = idParams(z.object({ userId: z.uuid() }))

const person = 'id, email, profile:profiles(name, picture_url)'

const argsOf = (
  id: string | null,
  { name, eventDate, budget, emails }: z.infer<typeof drawSchema>,
) => ({
  id,
  name,
  event_date: eventDate,
  budget,
  emails,
})

export const admin = new Hono<UserEnv>()
  .use(requireUser, requireAdmin)
  .get('/draws', async (context) => {
    const { data, error } = await databaseOf(context)
      .from('draws')
      .select('id, name, event_date, budget, drawn_at, participants(revealed_at)')
      .order('event_date', { ascending: false })

    if (error) throw httpErrorOf(error)

    return context.json(
      data.map(({ participants, ...draw }) => ({
        id: draw.id,
        name: draw.name,
        eventDate: draw.event_date,
        budget: draw.budget,
        status: statusOf(draw),
        participantCount: participants.length,
        revealedCount: participants.filter(({ revealed_at }) => revealed_at !== null).length,
      })),
    )
  })
  .post('/draws', jsonBody(drawSchema), async (context) => {
    const { data, error } = await databaseOf(context).rpc(
      'save_draw',
      argsOf(null, context.req.valid('json')),
    )

    if (error) throw httpErrorOf(error)

    return context.json({ id: data }, 201)
  })
  .get('/draws/:drawId', drawParams, async (context) => {
    const { data, error } = await databaseOf(context)
      .from('draws')
      .select(`id, name, event_date, budget, drawn_at, participants(${person}, revealed_at)`)
      .eq('id', context.req.valid('param').drawId)
      .maybeSingle()

    if (error) throw httpErrorOf(error)
    if (!data) return context.json({ error: 'Not found' }, 404)

    return context.json({
      id: data.id,
      name: data.name,
      eventDate: data.event_date,
      budget: data.budget,
      status: statusOf(data),
      drawnAt: data.drawn_at,
      participants: data.participants.map((participant) => ({
        ...personOf(participant),
        hasRevealed: participant.revealed_at !== null,
      })),
    })
  })
  .put('/draws/:drawId', drawParams, jsonBody(drawSchema), async (context) => {
    const { error } = await databaseOf(context).rpc(
      'save_draw',
      argsOf(context.req.valid('param').drawId, context.req.valid('json')),
    )

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
  .post('/draws/:drawId/run', drawParams, async (context) => {
    const { error } = await databaseOf(context).rpc('run_draw', {
      draw_id: context.req.valid('param').drawId,
    })

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
  .get('/draws/:drawId/assignments', drawParams, async (context) => {
    const { data, error } = await databaseOf(context)
      .from('assignments')
      .select(
        `giver:participants!assignments_giver_id_fkey(${person}),
        recipient:participants!assignments_recipient_id_fkey(${person})`,
      )
      .eq('draw_id', context.req.valid('param').drawId)

    if (error) throw httpErrorOf(error)

    return context.json(
      data.map(({ giver, recipient }) => ({
        giver: personOf(giver),
        recipient: personOf(recipient),
      })),
    )
  })
  .get('/users', async (context) => {
    const { data, error } = await databaseOf(context).rpc('admin_users')

    if (error) throw httpErrorOf(error)

    return context.json(
      data.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        pictureUrl: user.picture_url,
        signsInWithPassword: user.signs_in_with_password,
        signsInWithGoogle: user.signs_in_with_google,
        drawCount: user.draw_count,
      })),
    )
  })
  .put('/users/:userId/password', userParams, jsonBody(passwordSchema), async (context) => {
    const { error } = await databaseOf(context).rpc('set_user_password', {
      user_id: context.req.valid('param').userId,
      password: context.req.valid('json').password,
    })

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
