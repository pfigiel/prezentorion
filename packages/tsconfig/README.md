# @prezentorion/tsconfig

The shared TypeScript presets.

| Preset       | For                                                            |
| ------------ | -------------------------------------------------------------- |
| `base.json`  | Strict defaults, no DOM and no Node types                      |
| `node.json`  | base + Node types, for configs and tooling                     |
| `react.json` | base + DOM, JSX and Vite client types, for apps and components |

```json
{ "extends": "@prezentorion/tsconfig/react.json", "include": ["src"] }
```
