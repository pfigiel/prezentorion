import accountPl from '@/account/locales/pl.json'
import adminPl from '@/admin/locales/pl.json'
import authPl from '@/auth/locales/pl.json'
import drawsPl from '@/draws/locales/pl.json'
import managersPl from '@/managers/locales/pl.json'
import privacyPl from '@/privacy/locales/pl.json'
import shellPl from '@/shell/locales/pl.json'
import wishlistPl from '@/wishlist/locales/pl.json'

export const defaultLocale = 'pl'

const pl = {
  account: accountPl,
  admin: adminPl,
  auth: authPl,
  draws: drawsPl,
  managers: managersPl,
  privacy: privacyPl,
  shell: shellPl,
  wishlist: wishlistPl,
}

export const catalogs = { pl }

export type Messages = (typeof catalogs)[typeof defaultLocale]
