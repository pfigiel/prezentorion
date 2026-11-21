import { IconChevronLeft } from '@tabler/icons-react'
import { Link, type LinkProps } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './ScreenHeader.module.css'

type Props = {
  title: string
  /** Where the back arrow leads; a path rather than history, so a shared link still has a way back. */
  back?: LinkProps
  action?: ReactNode
}

export const ScreenHeader = ({ title, back, action }: Props) => {
  const { t } = useTranslation()

  return (
    <header className={classes.root}>
      {back === undefined ? null : (
        <Link {...back} aria-label={t('shell.header.back')} className={classes.back}>
          <IconChevronLeft stroke={1.8} aria-hidden />
        </Link>
      )}
      <h1 className={classes.title}>{title}</h1>
      {action}
    </header>
  )
}
