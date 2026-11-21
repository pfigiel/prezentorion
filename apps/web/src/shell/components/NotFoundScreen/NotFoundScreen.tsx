import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/ui/components/ButtonLink'
import { Card } from '@/ui/components/Card'
import { Logo } from '@/ui/components/Logo'
import { PageColumn } from '@/ui/components/PageColumn'
import classes from './NotFoundScreen.module.css'

export const NotFoundScreen = () => {
  const { t } = useTranslation()

  return (
    <PageColumn>
      <main className={classes.root}>
        <Logo size="lg" />
        <Card quiet className={classes.card}>
          <p className={classes.message}>{t('shell.notFound.message')}</p>
          <ButtonLink variant="secondary" renderLink={(props) => <Link {...props} to="/" />}>
            {t('shell.notFound.backHome')}
          </ButtonLink>
        </Card>
      </main>
    </PageColumn>
  )
}
