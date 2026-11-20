import { useTranslation } from 'react-i18next'
import classes from './OrDivider.module.css'

export const OrDivider = () => {
  const { t } = useTranslation()

  return <div className={classes.root}>{t('auth.login.or')}</div>
}
