import type { AppRouter } from '@/routing/router'

/** Fades out the splash in index.html once the router has loaded the first screen. */
export const dismissSplash = (router: AppRouter) => {
  const stopWaiting = router.subscribe('onResolved', () => {
    stopWaiting()

    const splash = document.getElementById('splash')

    if (splash === null) return

    splash.addEventListener('transitionend', () => splash.remove(), { once: true })
    splash.dataset.dismissed = ''
  })
}
