# @prezentorion/postcss-config

The shared PostCSS plugin list: `postcss-each` and `postcss-mixins` for the loops and mixins the
stylesheets use, `postcss-nesting`, and the cascade layer below.

```ts
// postcss.config.ts
import { createPostcssConfig } from '@prezentorion/postcss-config'

export default createPostcssConfig({ mixinsFiles: ['src/ui/mixins.css'] })
```

## Cascade layers

The list ends with `layerUiStyles`, which wraps every `*.module.css` under the web app's `src/ui` in
`@layer ui`. Everything else an app writes stays unlayered, and unlayered rules outrank every layer,
so a call site overrides a component without raising specificity or hoping the bundler emits its
file last.

`src/ui/globals.css` loads Mantine through `styles.layer.css` and declares the order:

```css
@layer mantine, ui;
```

Mantine first, then `src/ui`, then everything else. `globals.css` itself stays out, because it has
to outrank the theme Mantine injects at runtime, which is unlayered.
