import { Avatar as MantineAvatar } from '@mantine/core'
import clsx from 'clsx'
import classes from './Avatar.module.css'

type Size = 'md' | 'lg'

export type Props = {
  /** Null for someone known only by an address, who has not signed in yet. */
  name: string | null
  pictureUrl: string | null
  size?: Size
  className?: string
}

export const Avatar = ({ name, pictureUrl, size = 'md', className }: Props) => (
  <MantineAvatar
    src={pictureUrl}
    alt=""
    className={clsx(classes.root, classes[size], name === null && classes.pending, className)}
  >
    {name === null ? '?' : name.charAt(0)}
  </MantineAvatar>
)
