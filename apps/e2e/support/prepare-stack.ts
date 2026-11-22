// Run before `playwright test` rather than as its global setup: Playwright starts the web servers
// first, and the API's health check needs the database up.
import { execFileSync, type StdioOptions } from 'node:child_process'

const backendDir = new URL('../../backend', import.meta.url).pathname

// Only what the app reaches: the database, Auth, PostgREST, Storage and the gateway.
const unusedServices = [
  'realtime',
  'studio',
  'edge-runtime',
  'logflare',
  'vector',
  'imgproxy',
  'supavisor',
  'postgres-meta',
]

const supabase = (args: string[], stdio: StdioOptions = 'ignore') =>
  execFileSync('pnpm', ['exec', 'supabase', ...args], {
    cwd: backendDir,
    stdio,
    env: {
      ...process.env,
      // config.toml names it for the hosted project; nothing here signs in with Google.
      SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET:
        process.env.SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET ?? 'unused',
    },
  })

try {
  supabase(['status'])
} catch {
  supabase(['start', '--exclude', unusedServices.join(',')], 'inherit')
}

supabase(['migration', 'up'], 'inherit')
