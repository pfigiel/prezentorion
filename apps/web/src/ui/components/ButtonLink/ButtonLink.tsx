import { Button as MantineButton } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './ButtonLink.module.css'

type Variant = 'primary' | 'secondary'

/** What the link receives: the button's class and content, to spread onto the router's link. */
type LinkProps = {
  className?: string
  children?: ReactNode
}

export type Props = {
  variant?: Variant
  icon?: ReactNode
  className?: string
  children: ReactNode
  /** Renders the anchor itself, so ui stays free of the router while the result is a real link. */
  renderLink: (props: LinkProps) => ReactNode
}

export const ButtonLink = ({
  variant = 'primary',
  icon,
  className,
  children,
  renderLink,
}: Props) => (
  <MantineButton
    leftSection={icon}
    className={clsx(classes.root, classes[variant], className)}
    renderRoot={renderLink}
  >
    {children}
  </MantineButton>
)
