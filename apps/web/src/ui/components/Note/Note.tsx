import { IconInfoCircle } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import classes from './Note.module.css'

export type Props = {
  children: ReactNode
}

export const Note = ({ children }: Props) => (
  <p className={classes.root}>
    <IconInfoCircle stroke={1.8} aria-hidden className={classes.icon} />
    <span>{children}</span>
  </p>
)
