import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/ui/components/ButtonLink'
import { Card } from '@/ui/components/Card'
import classes from './ManagedListNotFound.module.css'

export const ManagedListNotFound = () => {
  const { t } = useTranslation()

  return (
    <Card quiet>
      <p className={classes.message}>{t('managers.list.notFound')}</p>
      <ButtonLink variant="secondary" renderLink={(props) => <Link {...props} to="/" />}>
        {t('managers.list.backHome')}
      </ButtonLink>
    </Card>
  )
}
