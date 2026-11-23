import * as Sentry from '@sentry/react'

/** Reports nothing where `VITE_SENTRY_DSN` is unset, as in development and the e2e suite. */
export const startMonitoring = () =>
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [Sentry.replayIntegration()],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1,
  })

export const reportError = (error: unknown) => {
  Sentry.captureException(error)
}

export const reportReactError = Sentry.reactErrorHandler()

export const identifyUser = (userId: string | null) =>
  Sentry.setUser(userId === null ? null : { id: userId })
