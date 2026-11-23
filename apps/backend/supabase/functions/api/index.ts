import * as Sentry from '@sentry/deno'
import { app } from './app.js'

// An isolate serves many requests, so the SDK's global handlers would mix them up; each error is reported below.
Sentry.init({ dsn: Deno.env.get('SENTRY_DSN'), defaultIntegrations: false })

// Mirrors Hono's own handler, which an HTTPException from the bundled copy of Hono would fail `instanceof` against.
app.onError(async (error, context) => {
  const response =
    'getResponse' in error ? error.getResponse() : context.text('Internal Server Error', 500)

  if (response.status >= 500) {
    console.error(error)
    Sentry.withScope((scope) => {
      scope.setUser({ id: context.get('jwtPayload')?.sub })
      scope.setTag('route', `${context.req.method} ${context.req.routePath}`)
      Sentry.captureException(error)
    })
    await Sentry.flush(2000)
  }

  return response
})

Deno.serve(app.fetch)
