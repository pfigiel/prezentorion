import { IconInfoCircle, IconX } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { IconButton } from '../IconButton'
import classes from './Note.module.css'

type Dismissal = {
  /** Names the close button for assistive technology. */
  label: string
  onDismiss: () => void
}

export type Props = {
  /** Gives the note a close button. */
  dismissal?: Dismissal
  children: ReactNode
}

export const Note = ({ dismissal, children }: Props) => (
  <p className={classes.root}>
    <IconInfoCircle stroke={1.8} aria-hidden className={classes.icon} />
    <span className={classes.text}>{children}</span>
    {dismissal === undefined ? null : (
      <span className={classes.close}>
        <IconButton label={dismissal.label} onClick={dismissal.onDismiss}>
          <IconX stroke={1.8} aria-hidden />
        </IconButton>
      </span>
    )}
  </p>
)
