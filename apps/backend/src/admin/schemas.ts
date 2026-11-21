import { z } from 'zod'

export const drawSchema = z.object({
  name: z.string().trim().min(1).max(80),
  eventDate: z.iso.date(),
  budget: z.number().int().min(0).nullable(),
  emails: z.array(z.string().trim().toLowerCase().pipe(z.email())).max(100),
})

export const passwordSchema = z.object({ password: z.string().min(8).max(72) })
