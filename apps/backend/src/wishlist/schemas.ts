import { z } from 'zod'

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable()

export const itemSchema = z.object({
  name: z.string().trim().min(1).max(120),
  url: optionalText(2000).pipe(z.url().nullable()),
  price: z.number().int().min(0).nullable(),
  note: optionalText(1000),
  priority: z.number().int().min(1).max(3),
  photoPath: z.string().max(300).nullable(),
})
