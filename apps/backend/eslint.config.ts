import { defineConfig } from 'eslint/config'
import { base } from '@prezentorion/eslint-config'

export default defineConfig(
  { ignores: ['supabase/functions/api/app.js'] },
  base(import.meta.dirname),
  {
    // Deno resolves a path as written, so an import names the file with its extension.
    files: ['supabase/functions/**'],
    rules: { 'n/file-extension-in-import': 'off' },
  },
)
