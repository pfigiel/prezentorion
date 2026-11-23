import { Hono } from 'hono'
import { z } from 'zod'
import { requireUser, type UserEnv } from '../auth'
import { databaseOf, httpErrorOf, type Database } from '../database'
import { idParams, jsonBody } from '../validation'
import { personOf } from './person-of'
import { statusOf } from './status-of'

const drawParams = idParams(z.object({ drawId: z.uuid() }))
const itemParams = idParams(z.object({ drawId: z.uuid(), itemId: z.uuid() }))
const participantParams = idParams(z.object({ drawId: z.uuid(), participantId: z.uuid() }))
const participantItemParams = idParams(
  z.object({ drawId: z.uuid(), participantId: z.uuid(), itemId: z.uuid() }),
)

const person = 'id, email, profile:profiles(name, picture_url)'

const giftOf = ({
  photo_path,
  purchased_by,
  other_buyers,
  ...item
}: Database['public']['Functions']['recipient_wishlist']['Returns'][number]) => ({
  ...item,
  photoPath: photo_path,
  purchasedBy: purchased_by,
  otherBuyers: other_buyers,
})

export const draws = new Hono<UserEnv>()
  .use(requireUser)
  .get('/', async (context) => {
    const { sub } = context.get('jwtPayload')
    const database = databaseOf(context)

    const { data, error } = await database
      .from('draws')
      .select(
        `id, name, event_date, budget, mode, drawn_at, everyone:participants(count),
        me:participants!inner(id, revealed_at)`,
      )
      .eq('me.user_id', sub)
      .order('event_date', { ascending: false })

    if (error) throw httpErrorOf(error)

    const { data: assignments, error: assignmentsError } = await database
      .from('assignments')
      .select(`giver_id, recipient:participants!assignments_recipient_id_fkey(${person})`)
      .in(
        'giver_id',
        data.flatMap(({ me }) =>
          me.filter((mine) => mine.revealed_at !== null).map(({ id }) => id),
        ),
      )

    if (assignmentsError) throw httpErrorOf(assignmentsError)

    return context.json(
      data.map(({ everyone, me, ...draw }) => {
        const recipient = assignments.find(({ giver_id }) => giver_id === me[0]?.id)?.recipient

        return {
          id: draw.id,
          name: draw.name,
          eventDate: draw.event_date,
          budget: draw.budget,
          mode: draw.mode,
          status: statusOf(draw),
          participantCount: everyone[0]?.count ?? 0,
          recipient: recipient ? personOf(recipient) : null,
        }
      }),
    )
  })
  .get('/:drawId', drawParams, async (context) => {
    const { sub } = context.get('jwtPayload')
    const { drawId } = context.req.valid('param')
    const database = databaseOf(context)

    const { data: draw, error } = await database
      .from('draws')
      .select(
        `id, name, event_date, budget, mode, drawn_at,
        participants(${person}, user_id, revealed_at)`,
      )
      .eq('id', drawId)
      .maybeSingle()

    if (error) throw httpErrorOf(error)

    const me = draw?.participants.find(({ user_id }) => user_id === sub)

    if (!draw || !me) return context.json({ error: 'Not found' }, 404)

    const { data: assignment, error: assignmentError } = await database
      .from('assignments')
      .select(`recipient:participants!assignments_recipient_id_fkey(${person})`)
      .eq('giver_id', me.id)
      .maybeSingle()

    if (assignmentError) throw httpErrorOf(assignmentError)

    const recipient = me.revealed_at === null ? undefined : assignment?.recipient

    return context.json({
      id: draw.id,
      name: draw.name,
      eventDate: draw.event_date,
      budget: draw.budget,
      mode: draw.mode,
      status: statusOf(draw),
      participants: draw.participants
        .map((participant) => ({ ...personOf(participant), isMe: participant.id === me.id }))
        .sort((a, b) => Number(b.isMe) - Number(a.isMe)),
      recipient: recipient ? personOf(recipient) : null,
    })
  })
  .post('/:drawId/reveal', drawParams, async (context) => {
    const { error } = await databaseOf(context).rpc('reveal_recipient', {
      draw_id: context.req.valid('param').drawId,
    })

    if (error) throw httpErrorOf(error)

    return context.body(null, 204)
  })
  .get('/:drawId/wishlist', drawParams, async (context) => {
    const { data, error } = await databaseOf(context).rpc('recipient_wishlist', {
      draw_id: context.req.valid('param').drawId,
    })

    if (error) throw httpErrorOf(error)

    return context.json(data.map(giftOf))
  })
  .put(
    '/:drawId/purchases/:itemId',
    itemParams,
    jsonBody(z.object({ purchased: z.boolean() })),
    async (context) => {
      const { drawId, itemId } = context.req.valid('param')
      const { error } = await databaseOf(context).rpc('set_purchased', {
        draw_id: drawId,
        item_id: itemId,
        purchased: context.req.valid('json').purchased,
      })

      if (error) throw httpErrorOf(error)

      return context.body(null, 204)
    },
  )
  .get('/:drawId/participants/:participantId/wishlist', participantParams, async (context) => {
    const { drawId, participantId } = context.req.valid('param')
    const { data, error } = await databaseOf(context).rpc('participant_wishlist', {
      draw_id: drawId,
      participant_id: participantId,
    })

    if (error) throw httpErrorOf(error)

    return context.json(data.map(giftOf))
  })
  .put(
    '/:drawId/participants/:participantId/purchases/:itemId',
    participantItemParams,
    jsonBody(z.object({ purchased: z.boolean() })),
    async (context) => {
      const { drawId, participantId, itemId } = context.req.valid('param')
      const { error } = await databaseOf(context).rpc('set_open_purchase', {
        draw_id: drawId,
        participant_id: participantId,
        item_id: itemId,
        purchased: context.req.valid('json').purchased,
      })

      if (error) throw httpErrorOf(error)

      return context.body(null, 204)
    },
  )
