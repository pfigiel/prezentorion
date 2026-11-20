import { Title } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './Heading.module.css'

type Order = 1 | 2 | 3
type Size = 'sm' | 'md' | 'lg'

const sizes = { 1: 'lg', 2: 'md', 3: 'sm' } as const satisfies Record<Order, Size>

export type Props = {
  order?: Order
  size?: Size
  className?: string
  children: ReactNode
}

export const Heading = ({ order = 2, size = sizes[order], className, children }: Props) => (
  <Title order={order} className={clsx(classes.root, classes[size], className)}>
    {children}
  </Title>
)
