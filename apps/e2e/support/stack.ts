/**
 * The local Supabase stack (`pnpm exec supabase start` in apps/backend), never the hosted project.
 * The CLI's fixed development defaults; the secret key is read from the CLI in the global setup.
 */
export const stack = {
  supabaseUrl: 'http://127.0.0.1:54321',
  publishableKey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
}

export const apiUrl = 'http://localhost:3000/api'

// The API answers CORS for this origin only, so the app must be served exactly here.
export const appUrl = 'http://localhost:5173'
