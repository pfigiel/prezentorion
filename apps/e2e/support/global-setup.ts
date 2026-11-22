import { execFileSync } from 'node:child_process'
import { removeLeftovers } from './service'

const backendDir = new URL('../../backend', import.meta.url).pathname

// Workers inherit the environment the global setup leaves, so the CLI is asked once per run.
const readSecretKey = () => {
  try {
    const output = execFileSync('pnpm', ['exec', 'supabase', 'status', '--output', 'json'], {
      cwd: backendDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    process.env.E2E_SUPABASE_SECRET_KEY = (
      JSON.parse(output.toString()) as { SECRET_KEY: string }
    ).SECRET_KEY
  } catch (error) {
    const reason = (error as { stderr?: Buffer }).stderr?.toString().trim()

    throw new Error(
      `Reading the local Supabase stack failed${reason ? `: ${reason}` : ''}\n` +
        'Run the suite through `pnpm e2e`, which starts it.',
      { cause: error },
    )
  }
}

export default async () => {
  readSecretKey()
  await removeLeftovers()
}
