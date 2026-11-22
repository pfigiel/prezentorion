import { execFileSync, type StdioOptions } from 'node:child_process'
import { removeLeftovers } from './service'

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

const supabase = (args: string[], stdio: StdioOptions = ['ignore', 'pipe', 'pipe']) =>
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

const statusOf = () => {
  try {
    return supabase(['status', '--output', 'json'])
  } catch {
    supabase(['start', '--exclude', unusedServices.join(',')], 'inherit')

    return supabase(['status', '--output', 'json'])
  }
}

// Workers inherit the environment the global setup leaves, so the CLI is asked once per run.
const prepareStack = () => {
  try {
    const status = statusOf()

    supabase(['migration', 'up'])

    process.env.E2E_SUPABASE_SECRET_KEY = (
      JSON.parse(status.toString()) as { SECRET_KEY: string }
    ).SECRET_KEY
  } catch (error) {
    const reason = (error as { stderr?: Buffer }).stderr?.toString().trim()

    throw new Error(
      `Preparing the local Supabase stack failed${reason ? `: ${reason}` : ''}\n` +
        'It needs Docker running.',
      { cause: error },
    )
  }
}

export default async () => {
  prepareStack()
  await removeLeftovers()
}
