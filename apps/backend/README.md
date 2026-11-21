# @prezentorion/backend

The API: [Hono](https://hono.dev), deployed as a single Supabase Edge Function named `api`.

`src/app.ts` is the app. Two entries serve it:

| Entry                             | Runs on                  | Serves the app through        |
| --------------------------------- | ------------------------ | ----------------------------- |
| `src/main.ts`                     | Node, `pnpm dev` locally | `@hono/node-server` on `PORT` |
| `supabase/functions/api/index.ts` | Supabase's Deno runtime  | `Deno.serve`, from the bundle |

Every route sits under `/api`, because Supabase keeps the function's name on the path, so a route
has one path everywhere: `http://localhost:3000/api/health` locally,
`<project>.supabase.co/functions/v1/api/health` deployed.

## Build

`pnpm build` bundles `src/app.ts` with esbuild into `supabase/functions/api/app.js` (gitignored),
which the function imports.

## Signing in

Supabase Auth signs a user in, with Google or with an e-mail and a password, and the web app sends
the access token as `Authorization: Bearer`. `requireUser` in `src/auth` verifies it against the
project's public signing keys and leaves its claims in `jwtPayload`.

The admin is whoever signs in with Google as an address listed in the `admins` table. Addresses are
never confirmed, so only Google proves one; an account made with a password never counts as admin,
whatever its address.

## Database

A route reads and writes Postgres through PostgREST as the user who called it: `databaseOf` builds a
client that forwards the request's access token, so row level security decides what the request
reaches and no route holds a key that bypasses it.

What row level security cannot express on its own runs in `security definer` functions, each
checking its caller first:

- `save_draw` and `run_draw` — the admin's edits; changing who takes part in a drawn draw draws it
  again, and every draw wipes the reveals and purchases the last one left.
- `reveal_recipient` — a giver sees their assignment only after revealing it, and the reveal is kept
  so the admin can see who has looked.
- `recipient_wishlist`, `set_purchased`, `my_wishlist`, `mark_available` — purchases are never read
  directly: a giver sees who bought what on their recipient's list, while the list's owner sees an
  item as bought only from the event day of the draw it was bought under.
- `admin_users`, `set_user_password` — there is no e-mail reset; the admin sets a temporary
  password.

The schema lives in `supabase/migrations`, and `src/database/schema.ts` mirrors it for the types a
query returns: a migration that changes a table or a function changes that file with it. Wish list
photos sit in the private `wish-photos` bucket, under a folder named after their owner's id; the web
app uploads and reads them directly, and a giver reads the folder of whoever they revealed.

`GET /api/health` calls `ping()` as anon. A scheduled workflow calls it every few days, so the free
project sees activity between seasons and is not paused.

## Supabase

The Supabase CLI is a dev dependency; run it with `pnpm exec supabase` from this folder.

`supabase/config.toml` is the hosted project's configuration: who may sign in and how, and where
Auth may send a user back to. It declares only what differs from the defaults.

Deploying happens on every merge to `main`, in
[the deploy workflow](../../.github/workflows/deploy.yml): it pushes `config.toml` to the project,
applies the migrations not yet applied, then deploys the function. It names the project and reads
`SUPABASE_ACCESS_TOKEN` and `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` from the repository's secrets.
