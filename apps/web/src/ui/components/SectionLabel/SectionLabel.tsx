import type { ReactNode } from 'react'
import classes from './SectionLabel.module.css'

export type Props = {
  children: ReactNode
}

/** The small uppercase line above a group of cards; a heading for the outline, not for the eye. */
export const SectionLabel = ({ children }: Props) => <h2 className={classes.root}>{children}</h2>
