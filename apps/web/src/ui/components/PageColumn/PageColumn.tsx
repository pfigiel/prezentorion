import type { ReactNode } from 'react'
import classes from './PageColumn.module.css'

type Props = {
  children: ReactNode
}

/** The phone-width column every screen sits in; on a wider window it stands framed on the sky. */
export const PageColumn = ({ children }: Props) => <div className={classes.root}>{children}</div>
