import accountPl from '@/account/locales/pl.json'
import authPl from '@/auth/locales/pl.json'
import drawsPl from '@/draws/locales/pl.json'
import shellPl from '@/shell/locales/pl.json'

export const defaultLocale = 'pl'

const pl = {
  account: accountPl,
  auth: authPl,
  draws: drawsPl,
  shell: shellPl,
}

export const catalogs = { pl }

export type Messages = (typeof catalogs)[typeof defaultLocale]
