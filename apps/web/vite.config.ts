import { fileURLToPath } from 'node:url'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const night = '#0b1a33'

// Only the deploy job has a Sentry token; every other build ships without source maps.
const uploadsSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN)

export default defineConfig({
  // tanstackRouter generates src/routing/routeTree.gen.ts from src/routes and has to see
  // the JSX before @vitejs/plugin-react transforms it, so order matters.
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: 'src/routes',
      generatedRouteTree: 'src/routing/routeTree.gen.ts',
    }),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Prezentorion',
        short_name: 'Prezentorion',
        description: 'Podarunki nie z tej ziemi',
        lang: 'pl',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: night,
        background_color: night,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        globIgnores: ['og-image.png', 'splash/**'],
      },
    }),
    sentryVitePlugin({
      disable: !uploadsSourceMaps,
      telemetry: false,
      sourcemaps: { filesToDeleteAfterUpload: ['dist/**/*.map'] },
    }),
  ],
  build: {
    sourcemap: uploadsSourceMaps ? 'hidden' : false,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
})
