import { env } from 'hono/adapter'
import { cors } from 'hono/cors'

const webOrigins = ['https://prezentorion.vercel.app', 'http://localhost:5173']

// The e2e suite serves the app on a port of its own, so it does not collide with `pnpm dev`.
type CorsEnv = { E2E_WEB_ORIGIN?: string }

export const webCors = cors({
  origin: (origin, context) => {
    const { E2E_WEB_ORIGIN } = env<CorsEnv>(context)

    return webOrigins.includes(origin) || origin === E2E_WEB_ORIGIN ? origin : null
  },
  allowHeaders: ['Authorization', 'Content-Type'],
})
