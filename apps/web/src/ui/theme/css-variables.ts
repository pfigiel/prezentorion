import type { CSSVariablesResolver } from '@mantine/core'
import { flattenTokens } from './flatten-tokens'
import { toCssVariables } from './to-css-variables'
import { tokens } from './tokens'

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: toCssVariables(flattenTokens(tokens)),
  light: {},
  dark: {
    // Mantine paints the page from a variable no stylesheet of ours may name, and defines it per
    // scheme, so it is overridden there; globals.css lays the sky gradient over it.
    '--mantine-color-body': tokens.sky.color.middle,
    '--mantine-color-text': tokens.text.color.default,
  },
})
