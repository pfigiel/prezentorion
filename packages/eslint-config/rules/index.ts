import type { ESLint } from 'eslint'
import noRepeatedPathSegment from './no-repeated-path-segment'
import propsTypeName from './props-type-name'

export const prezentorion: ESLint.Plugin = {
  meta: { name: 'prezentorion' },
  rules: {
    'no-repeated-path-segment': noRepeatedPathSegment,
    'props-type-name': propsTypeName,
  },
}
