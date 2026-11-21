import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Badge.module.css'

type Tone = 'accent' | 'pending' | 'neutral'

export type Props = {
  tone?: Tone
  children: ReactNode
}

export const Badge = ({ tone = 'accent', children }: Props) => (
  <span className={clsx(classes.root, classes[tone])}>{children}</span>
)
