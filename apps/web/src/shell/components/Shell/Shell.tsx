import type { ReactNode } from 'react'
import { AccountMenu } from '@/account/components/AccountMenu'
import { Logo } from '@/ui/components/Logo'
import classes from './Shell.module.css'

type Props = {
  children: ReactNode
}

export const Shell = ({ children }: Props) => (
  <div className={classes.root}>
    <header className={classes.header}>
      <Logo />
      <AccountMenu />
    </header>
    <main className={classes.main}>{children}</main>
  </div>
)
