import { Button as MantineButton } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Button.module.css'

type Variant = 'primary' | 'secondary' | 'danger' | 'light'
type Size = 'sm' | 'md' | 'lg'

export type Props = {
  variant?: Variant
  size?: Size
  type?: 'button' | 'submit'
  icon?: ReactNode
  disabled?: boolean
  loading?: boolean
  className?: string
  children: ReactNode
  onClick?: () => void
}

export const Button = ({
  variant = 'primary',
  size = 'lg',
  type = 'button',
  icon,
  disabled,
  loading,
  className,
  children,
  onClick,
}: Props) => (
  <MantineButton
    type={type}
    leftSection={icon}
    disabled={disabled}
    loading={loading}
    className={clsx(classes.root, classes[variant], classes[size], className)}
    onClick={onClick}
  >
    {children}
  </MantineButton>
)
