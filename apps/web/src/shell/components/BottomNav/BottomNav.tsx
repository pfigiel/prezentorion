import { IconAdjustmentsHorizontal, IconArrowsShuffle, IconGift } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import classes from './BottomNav.module.css'

export const BottomNav = () => {
  const { t } = useTranslation()
  const { data: account } = useSuspenseQuery(accountQuery)

  return (
    <nav aria-label={t('shell.nav.label')} className={classes.root}>
      <Link to="/" className={classes.link} activeProps={{ 'aria-current': 'page' }}>
        <IconArrowsShuffle stroke={1.8} />
        {t('shell.nav.draws')}
      </Link>
      <Link to="/wishlist" className={classes.link} activeProps={{ 'aria-current': 'page' }}>
        <IconGift stroke={1.8} />
        {t('shell.nav.wishlist')}
      </Link>
      {account.isAdmin ? (
        <Link to="/admin" className={classes.link} activeProps={{ 'aria-current': 'page' }}>
          <IconAdjustmentsHorizontal stroke={1.8} />
          {t('shell.nav.admin')}
        </Link>
      ) : null}
    </nav>
  )
}
