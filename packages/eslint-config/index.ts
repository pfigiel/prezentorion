import eslintComments from '@eslint-community/eslint-plugin-eslint-comments'
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
// @ts-expect-error eslint-plugin-jsx-a11y ships no types.
import jsxA11y from 'eslint-plugin-jsx-a11y'
import n from 'eslint-plugin-n'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { prezentorion } from './rules/index'

const noExportAll = {
  selector: 'ExportAllDeclaration',
  message:
    'Re-export by name. `export *` forwards whatever the module happens to export, including what it exports only for its neighbours.',
}

export const base = (tsconfigRootDir: string) =>
  defineConfig(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      languageOptions: {
        globals: { ...globals.node },
      },
      linterOptions: {
        reportUnusedDisableDirectives: 'error',
      },
      plugins: { '@eslint-community/eslint-comments': eslintComments, prezentorion },
      rules: {
        '@eslint-community/eslint-comments/require-description': 'error',
        'prezentorion/no-repeated-path-segment': 'error',
        'no-restricted-syntax': ['error', noExportAll],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { args: 'all', argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
        'arrow-body-style': ['error', 'as-needed'],
        'max-lines': ['error', { max: 300, skipBlankLines: false, skipComments: false }],
      },
    },
    {
      // Bundler-resolved, so `./x.js` names no file while `./x.css` names one.
      files: ['**/*.{ts,tsx}'],
      plugins: { n },
      rules: {
        'n/file-extension-in-import': [
          'error',
          'never',
          { '.css': 'always', '.json': 'always', '.png': 'always' },
        ],
      },
    },
    {
      // Declaration merging needs `interface`, so the `type` preference cannot apply.
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/consistent-type-definitions': 'off',
      },
    },
    { languageOptions: { parserOptions: { tsconfigRootDir } } },
    prettier,
  )

export const react = (tsconfigRootDir: string) =>
  defineConfig(
    base(tsconfigRootDir),
    reactHooks.configs.flat.recommended,
    jsxA11y.flatConfigs.recommended,
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        globals: { ...globals.browser },
      },
      plugins: { react: reactPlugin },
      settings: { react: { version: '19.2' } },
      rules: {
        'prezentorion/props-type-name': 'error',
        'react/function-component-definition': [
          'error',
          { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
        ],
      },
    },
    prettier,
  )
