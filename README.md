# Prezentorion

A Secret Santa app for family and friends: an administrator runs the draws, everyone reveals whom
they buy for and keeps a gift wish list. A draw can also be open, drawing nobody: once it starts,
everyone browses everyone else's list. An installable, mobile-first PWA.

One pnpm workspace run through turbo:

| Package                                              | What it is                                   |
| ---------------------------------------------------- | -------------------------------------------- |
| [`apps/web`](apps/web)                               | The application — Vite, React, TanStack, PWA |
| [`apps/backend`](apps/backend)                       | The API — Hono, deployed to Supabase         |
| [`apps/e2e`](apps/e2e)                               | End-to-end tests — Playwright                |
| [`packages/eslint-config`](packages/eslint-config)   | Shared ESLint presets and rules of our own   |
| [`packages/postcss-config`](packages/postcss-config) | Shared PostCSS plugins                       |
| [`packages/tsconfig`](packages/tsconfig)             | Shared TypeScript presets                    |

Coding standards are in [AGENTS.md](AGENTS.md), which every coding agent loads automatically.

## Prerequisites

- [**nvm**](https://github.com/nvm-sh/nvm#installing-and-updating) — manages Node versions.
- [**Node**](https://nodejs.org) — the version in [`.nvmrc`](.nvmrc), which `nvm use` installs.
- [**pnpm**](https://pnpm.io/installation) — the version pinned as `packageManager` in
  [`package.json`](package.json).
- [**Docker**](https://docs.docker.com/get-docker/) — only for `pnpm e2e`, which runs against a
  local Supabase stack; see [`apps/e2e`](apps/e2e).

## Getting started

1. `nvm use`
2. `pnpm install` — also installs the git hooks below.
3. `pnpm dev` — serves the app at http://localhost:5173 and the API at http://localhost:3000
   (`GET /api/health`), both on the **hosted** project, with its real people and draws.

### Trying a change before it goes live

`pnpm dev:local` serves the same app and API on the same ports, but against a local Supabase stack
in Docker — the one `pnpm e2e` runs on — so nothing touches the hosted project. It starts the stack
if needed, applies the migrations not yet applied to it, and creates four accounts to sign in with
by e-mail and password `password123`: `admin@local.test`, the admin, and `anna@`, `bartek@` and
`celina@local.test`. Each starts with a few items on their wish list, added only while the list is
empty, so your own edits survive the next run. The admin also manages Anna's list. Google sign-in
does not work locally.

The stack keeps its data between runs; `pnpm exec supabase db reset` in `apps/backend` empties it,
and `pnpm dev:local` then creates the accounts again. `pnpm exec supabase stop` there stops it.

## Commands

Every task runs through turbo, so it covers each package that defines it.

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `pnpm dev`        | Runs each package's dev server                 |
| `pnpm dev:local`  | The same, against the local Supabase stack     |
| `pnpm build`      | Builds every package                           |
| `pnpm preview`    | Builds, then serves the build                  |
| `pnpm e2e`        | End-to-end tests, against the local stack      |
| `pnpm lint`       | ESLint                                         |
| `pnpm lint:css`   | Stylelint over every CSS file                  |
| `pnpm type:check` | `tsc --noEmit`                                 |
| `pnpm knip`       | Reports unused files, exports and dependencies |
| `pnpm deps:audit` | Fails on a high or critical advisory           |
| `pnpm format`     | Prettier, writing in place                     |

## What runs without you asking

- **On commit** — Prettier, Stylelint, ESLint, `type:check` and `knip` over what you staged, then
  `pnpm e2e`, which needs Docker running.
- **On push** — `deps:audit`.
- **On a pull request** — Prettier, ESLint, Stylelint, `type:check`, `knip` and the build, in
  [CI](.github/workflows/ci.yml).
- **On `main` after a merge** — the same checks, and once they pass the API deploys to Supabase and
  the app to Vercel, in [the deploy workflow](.github/workflows/deploy.yml).
