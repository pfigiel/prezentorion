import { MantineProvider } from '@mantine/core'
import type { ReactNode } from 'react'
import { cssVariablesResolver } from './css-variables'
import './fonts'
import { theme } from './theme'

export type Props = {
  children: ReactNode
}

// Forced rather than defaulted: a default yields to a scheme the browser has stored.
export const UiProvider = ({ children }: Props) => (
  <MantineProvider
    theme={theme}
    cssVariablesResolver={cssVariablesResolver}
    forceColorScheme="dark"
  >
    {children}
  </MantineProvider>
)
