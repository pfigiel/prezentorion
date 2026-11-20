import { defineConfig } from 'eslint/config'
import { react } from '@prezentorion/eslint-config'

export default defineConfig(
  { ignores: ['dist/**', '.vercel/**', 'src/routing/routeTree.gen.ts'] },
  react(import.meta.dirname),
  {
    ignores: ['src/ui/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@mantine/*'],
              message:
                'Import from @/ui instead. If something is missing, add a narrowed wrapper there.',
            },
          ],
        },
      ],
    },
  },
)
