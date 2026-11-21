import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/ui/components/ButtonLink'
import { Card } from '@/ui/components/Card'
import classes from './DrawNotFound.module.css'

export const DrawNotFound = () => {
  const { t } = useTranslation()

  return (
    <Card quiet>
      <p className={classes.message}>{t('draws.draw.notFound')}</p>
      <ButtonLink variant="secondary" renderLink={(props) => <Link {...props} to="/" />}>
        {t('draws.draw.backHome')}
      </ButtonLink>
    </Card>
  )
}
