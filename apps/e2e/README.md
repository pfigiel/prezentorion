# @prezentorion/e2e

End-to-end tests: [Playwright](https://playwright.dev) driving the app in Chromium at phone size,
against a local Supabase stack, never the hosted project.

## Running

1. Start the stack once, from `apps/backend`: `pnpm exec supabase start`. It applies the migrations;
   after adding one, `pnpm exec supabase migration up` applies it to the running stack.
2. Install the browser once: `pnpm --filter @prezentorion/e2e exec playwright install chromium`.
3. `pnpm e2e` from the repository root.

Playwright starts the API on port 3000 and the app on 5173 itself, pointed at the stack. It never
reuses a server already there, since one may be `pnpm dev` talking to the hosted project, so stop
`pnpm dev` first. To watch tests run, `pnpm --filter @prezentorion/e2e exec playwright test --ui`.

## How a test is set up

- **People.** Each test creates the accounts it needs through the Auth admin API: `createPerson` in
  [`support/service.ts`](support/service.ts). An admin is also marked as signed in with Google,
  which is what the admin check asks for, so no Google sign-in is involved.
- **Perspectives.** `sessionOf(person)` in [`support/test.ts`](support/test.ts) opens a page signed
  in as that person, in a browser context of its own, so one test can follow the admin, a giver and
  a recipient side by side.
- **Scenes.** What a test is not about is set up through the app's own API
  ([`support/scenes.ts`](support/scenes.ts)): draws, reveals, wish-list items, purchases.
- **Time.** `setEventDate` moves a draw's event day with the service key, for what changes once an
  event has passed.

Everything a test creates is unique to it, so tests run in parallel. Its accounts end in `@e2e.test`
and its draw names in a marker, and the next run's global setup deletes them; a failed run leaves
its data in place to look at.
