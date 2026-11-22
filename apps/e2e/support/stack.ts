/**
 * The local Supabase stack (`pnpm exec supabase start` in apps/backend), never the hosted project.
 * The CLI's fixed development defaults; the secret key is read from the CLI in the global setup.
 */
export const stack = {
  supabaseUrl: 'http://127.0.0.1:54321',
  publishableKey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
}

// Ports of their own, so the suite runs beside `pnpm dev` on 3000 and 5173.
export const apiPort = 3100
export const appPort = 5273

export const apiUrl = `http://localhost:${apiPort}/api`
export const appUrl = `http://localhost:${appPort}`
