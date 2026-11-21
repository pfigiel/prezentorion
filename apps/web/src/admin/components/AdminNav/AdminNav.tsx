import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import classes from './AdminNav.module.css'

export const AdminNav = () => {
  const { t } = useTranslation()

  return (
    <nav aria-label={t('admin.nav.label')} className={classes.root}>
      <Link
        to="/admin"
        activeOptions={{ exact: true }}
        activeProps={{ 'aria-current': 'page' }}
        className={classes.link}
      >
        {t('admin.nav.draws')}
      </Link>
      <Link to="/admin/users" activeProps={{ 'aria-current': 'page' }} className={classes.link}>
        {t('admin.nav.users')}
      </Link>
    </nav>
  )
}
