import { HTTPException } from 'hono/http-exception'

type PostgrestError = { code: string; message: string }

// The SQL functions raise these codes on purpose, so each maps to the answer it stands for.
const statuses = {
  '42501': 403,
  P0002: 404,
  '22023': 400,
  '23505': 409,
} as const

export const httpErrorOf = (error: PostgrestError) => {
  const status = error.code in statuses ? statuses[error.code as keyof typeof statuses] : 500

  return new HTTPException(status, { message: error.message })
}
