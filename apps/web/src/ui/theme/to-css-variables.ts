import type { CssVariables } from './tokens'

export const toCssVariables = (tokens: Record<string, string>): CssVariables =>
  Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--pz-${name}`, value]))
