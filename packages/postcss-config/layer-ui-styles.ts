import type { Plugin } from 'postcss'

/* The web app's `src/ui` folder plays the part of a component library; globals.css there orders this layer. */
const uiStylesheet = /[\\/]src[\\/]ui[\\/].*\.module\.css$/

export const layerUiStyles = (): Plugin => ({
  postcssPlugin: 'prezentorion-layer-ui-styles',
  Once: (root, { AtRule }) => {
    const file = root.source?.input.file

    if (!file || !uiStylesheet.test(file)) {
      return
    }

    const layer = new AtRule({ name: 'layer', params: 'ui' })
    const styles = root.nodes

    root.removeAll()
    layer.append(styles)
    root.append(layer)
  },
})
