import { Collapse as MantineCollapse } from '@mantine/core'
import { useReducedMotion } from '@mantine/hooks'
import type { ReactNode } from 'react'
import { tokens } from '@/ui/theme/tokens'

export type Props = {
  opened: boolean
  children: ReactNode
}

// Mantine animates the height from script, so it takes the duration as a number, not the CSS token.
const duration = Number.parseInt(tokens.motion.duration, 10)

/** Folds its content away, leaving no space behind once closed. */
export const Collapse = ({ opened, children }: Props) => {
  const reducedMotion = useReducedMotion()

  return (
    <MantineCollapse
      expanded={opened}
      transitionDuration={reducedMotion ? 0 : duration}
      transitionTimingFunction={tokens.motion.easing}
    >
      {children}
    </MantineCollapse>
  )
}
