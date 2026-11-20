import { createTheme } from '@mantine/core'
import { tokens } from './tokens'

export const theme = createTheme({
  fontFamily: tokens.font.family.body,
  headings: { fontFamily: tokens.font.family.body },
})
