# @prezentorion/web

The Prezentorion application: Vite, React, TanStack Router and Query, Mantine wrapped in `src/ui`,
installable as a PWA.

Setup and commands are in the [workspace README](../../README.md); where a new file goes is in
[AGENTS.md](../../AGENTS.md#app-structure).

## Layout

| Path                     | What lives there                                                      |
| ------------------------ | --------------------------------------------------------------------- |
| `src/routes`             | Routing only — a path, its params, what loads before a screen renders |
| `src/ui`                 | Mantine wrappers, design tokens and global styles                     |
| `src/locales`            | Merges each domain's catalogs into one per locale                     |
| `src/App.tsx`            | The providers every screen sits inside                                |
| `src/routing/router.tsx` | The router                                                            |

## Routing

`src/routing/routeTree.gen.ts` is generated from `src/routes` and committed, so a fresh clone
typechecks before Vite has run — never edit it. `src/routing/router-register.d.ts` is what makes
`<Link to>` reject a path that does not exist.

## Translations

User-facing text comes from `<domain>/locales/<locale>.json` through `t()`. Keys are typed, so a
missing one fails `type:check` instead of rendering itself. Polish is the only locale.

## Signing in

Google or e-mail and password, through Supabase Auth; e-mail addresses are not confirmed. Everything
under `src/routes/_authenticated` needs a session and sends a visitor without one to `/login`;
`src/auth` holds the Supabase client and `fetchApi`, which calls the API with the user's token.

`.env.development` and `.env.production` name the Supabase project and the API. Both are committed:
the publishable key is meant to be public. `pnpm dev` signs in against the hosted project, so there
is no local Auth to run. `pnpm dev:local` runs Vite in the `stack` mode instead, whose `.env.stack`
names the local Supabase stack.

## PWA

`vite-plugin-pwa` generates the manifest and a service worker that precaches the built app and
updates itself on the next visit after a deploy. API and Supabase requests are never cached. The
icons and `og-image.png` in `public` are rendered from the design canvas.

## Deploying

Every merge to `main` builds the app and deploys it to Vercel, in
[the deploy workflow](../../.github/workflows/deploy.yml), which names the Vercel project and reads
`VERCEL_TOKEN` from the repository's secrets. [`vercel.json`](vercel.json) holds the project's
settings: every path serves `index.html` so the router can answer it, and Vercel's own Git
deployments are off so the workflow is the only thing that deploys.
