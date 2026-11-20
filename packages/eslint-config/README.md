# @prezentorion/eslint-config

The shared ESLint presets. `base` for any package, `react` for anything rendering.

```ts
// eslint.config.ts
import { react } from '@prezentorion/eslint-config'

export default react(import.meta.dirname)
```

The directory argument is not optional: typescript-eslint otherwise infers `tsconfigRootDir` from
whichever config file read the preset, and an editor linting two packages at once gets two answers
and fails. Each package passes its own.

Configs are TypeScript, so a consuming package needs `jiti` — ESLint loads `.ts` config through it.

## Rules of our own

| Rule                       | What it catches                                          |
| -------------------------- | -------------------------------------------------------- |
| `no-repeated-path-segment` | `../Alert/Alert` — reaching past a barrel into the file  |
| `props-type-name`          | `AlertProps` where the file already says which component |

They exist because [AGENTS.md](../../AGENTS.md) should only carry rules a linter cannot enforce.
