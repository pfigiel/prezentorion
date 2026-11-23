import { z } from 'zod'

const emailSchema = z.string().trim().toLowerCase().pipe(z.email())

export const drawSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    eventDate: z.iso.date(),
    budget: z.number().int().min(0).nullable(),
    emails: z.array(emailSchema).max(100),
    excludedPairs: z.array(z.tuple([emailSchema, emailSchema])).max(1000),
  })
  .refine(
    ({ emails, excludedPairs }) =>
      excludedPairs.every(
        ([first, second]) => first !== second && emails.includes(first) && emails.includes(second),
      ),
    { path: ['excludedPairs'], message: 'Each pair is two different participants' },
  )

export const passwordSchema = z.object({ password: z.string().min(8).max(72) })
