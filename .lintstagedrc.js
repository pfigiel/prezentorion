export default {
  '*': 'prettier --check --ignore-unknown',
  '*.css': 'stylelint',
  '*.{ts,tsx,js}': () => 'pnpm lint',
  '*.{ts,tsx,json}': () => 'pnpm type:check',
  '*.{ts,tsx,js,json,yaml}': () => 'pnpm knip',
}
