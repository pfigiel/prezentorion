// @ts-expect-error postcss-each ships no types; it is a plain PostCSS plugin factory.
import postcssEach from 'postcss-each'
import type { Config } from 'postcss-load-config'
import postcssMixins from 'postcss-mixins'
import postcssNesting from 'postcss-nesting'
import { layerUiStyles } from './layer-ui-styles'

type Options = {
  mixinsFiles: string[]
}

export const createPostcssConfig = ({ mixinsFiles }: Options): Config => ({
  plugins: [postcssEach(), postcssMixins({ mixinsFiles }), postcssNesting(), layerUiStyles()],
})
