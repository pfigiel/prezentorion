// Starts the local Supabase stack if it is not running, and applies any migration it lacks: what
// `pnpm e2e` and `pnpm dev:local` run on.
import { execFileSync, type StdioOptions } from 'node:child_process'

const backendDir = new URL('..', import.meta.url).pathname

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
