import { validator } from 'hono/validator'
import type { z } from 'zod'

export const jsonBody = <Schema extends z.ZodType>(schema: Schema) =>
  validator('json', (value, context) => {
    const parsed = schema.safeParse(value)

    return parsed.success ? parsed.data : context.json({ error: 'Invalid body' }, 400)
  })

/** An id that is not a uuid names nothing, so it answers as a missing row would. */
export const idParams = <Schema extends z.ZodType>(schema: Schema) =>
  validator('param', (value, context) => {
    const parsed = schema.safeParse(value)

    return parsed.success ? parsed.data : context.json({ error: 'Not found' }, 404)
  })
