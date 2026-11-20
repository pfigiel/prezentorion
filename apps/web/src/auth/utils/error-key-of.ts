import { isAuthError } from '@supabase/supabase-js'

const knownCodes = ['invalid_credentials', 'user_already_exists', 'weak_password'] as const

type KnownCode = (typeof knownCodes)[number]

const isKnownCode = (code: string | undefined): code is KnownCode =>
  knownCodes.some((known) => known === code)

export const errorKeyOf = (error: unknown) => {
  const code = isAuthError(error) ? error.code : undefined

  return `auth.login.errors.${isKnownCode(code) ? code : 'unknown'}` as const
}
