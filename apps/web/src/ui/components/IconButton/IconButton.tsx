import { ActionIcon } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './IconButton.module.css'

export type Props = {
  /** Names the button for assistive technology; the icon alone says nothing. */
  label: string
  children: ReactNode
  onClick: () => void
}

export const IconButton = ({ label, children, onClick }: Props) => (
  <ActionIcon aria-label={label} className={classes.root} onClick={onClick}>
    {children}
  </ActionIcon>
)
