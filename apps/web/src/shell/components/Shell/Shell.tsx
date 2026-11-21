import type { ReactNode } from 'react'
import { AccountMenu } from '@/account/components/AccountMenu'
import { Logo } from '@/ui/components/Logo'
import { useScrolled } from '../../hooks/use-scrolled'
import { BottomNav } from '../BottomNav'
import classes from './Shell.module.css'

type Props = {
  children: ReactNode
}

export const Shell = ({ children }: Props) => {
  const scrolled = useScrolled()

  return (
    <div className={classes.root}>
      <header className={classes.header} data-scrolled={scrolled || undefined}>
        <Logo />
        <AccountMenu />
      </header>
      <main className={classes.main}>{children}</main>
      <BottomNav />
    </div>
  )
}
