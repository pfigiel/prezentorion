import { defineConfig } from '@playwright/test'
import { apiUrl, appUrl, stack } from './support/stack'
import { phone } from './support/test'

const repoRoot = new URL('../..', import.meta.url).pathname

// Never reused: a server already on these ports may be `pnpm dev` talking to the hosted project.
const reuseExistingServer = false

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: process.env.CI !== undefined,
  retries: process.env.CI === undefined ? 0 : 1,
  globalSetup: './support/global-setup.ts',
  expect: { timeout: 10_000 },
  use: { ...phone, trace: 'retain-on-failure' },
  webServer: [
    {
      command: 'pnpm --filter @prezentorion/backend dev',
      cwd: repoRoot,
      url: `${apiUrl}/health`,
      reuseExistingServer,
      env: {
        SUPABASE_URL: stack.supabaseUrl,
        SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: stack.publishableKey }),
      },
    },
    {
      command: 'pnpm --filter @prezentorion/web dev',
      cwd: repoRoot,
      url: appUrl,
      reuseExistingServer,
      env: {
        VITE_SUPABASE_URL: stack.supabaseUrl,
        VITE_SUPABASE_PUBLISHABLE_KEY: stack.publishableKey,
        VITE_API_URL: apiUrl,
      },
    },
  ],
})
