import { IconChevronLeft } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { sections } from '@/privacy/constants/sections'
import { Heading } from '@/ui/components/Heading'
import { PageColumn } from '@/ui/components/PageColumn'
import classes from './PrivacyPolicyScreen.module.css'

export const PrivacyPolicyScreen = () => {
  const { t } = useTranslation()

  return (
    <PageColumn>
      <main className={classes.root}>
        <Link to="/" className={classes.back}>
          <IconChevronLeft stroke={1.8} aria-hidden />
          {t('privacy.policy.back')}
        </Link>
        <header className={classes.header}>
          <Heading order={1}>{t('privacy.policy.title')}</Heading>
          <p className={classes.updated}>{t('privacy.policy.updated')}</p>
        </header>
        {sections.map((section) => (
          <section key={section} className={classes.section}>
            <Heading order={2} size="sm">
              {t(`privacy.policy.sections.${section}.title`)}
            </Heading>
            <p className={classes.body}>{t(`privacy.policy.sections.${section}.body`)}</p>
          </section>
        ))}
      </main>
    </PageColumn>
  )
}
