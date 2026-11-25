import { useSyncExternalStore } from 'react'

/** Chromium's `beforeinstallprompt` event, which the DOM typings leave out. */
type DeferredPrompt = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: DeferredPrompt | null = null
const listeners = new Set<() => void>()

const keep = (next: DeferredPrompt | null) => {
  deferred = next
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

/** Holds back the browser's own install banner, which can fire before React renders anything. */
export const listenForInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    keep(event as DeferredPrompt)
  })
}

/** The browser's install dialog, available on Android in Chromium browsers until it has been shown. */
export const useInstallDialog = () => {
  const available = useSyncExternalStore(subscribe, () => deferred !== null)

  const open = async () => {
    const event = deferred

    if (event === null) return false

    // An event opens its dialog once; the browser fires a new one if it may ask again.
    keep(null)
    await event.prompt()

    return (await event.userChoice).outcome === 'accepted'
  }

  return { available, open }
}
