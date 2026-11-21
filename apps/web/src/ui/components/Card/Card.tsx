import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Card.module.css'

export type Props = {
  /** Steps back from the cards around it: something waiting, or a hint rather than content. */
  quiet?: boolean
  className?: string
  children: ReactNode
}

export const Card = ({ quiet = false, className, children }: Props) => (
  <section data-surface className={clsx(classes.root, quiet && classes.quiet, className)}>
    {children}
  </section>
)
