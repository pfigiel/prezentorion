import { useSyncExternalStore } from 'react'

/** An explanatory banner someone may close, and bring back from the account menu. */
export type HintName =
  'wishlist' | 'managers' | 'managedList' | 'openDraw' | 'excludedPairs' | 'assignments'

const storageKey = 'pz-dismissed-hints'

// Storage may be missing or refuse access, as in a private window; then a hint stays closed only
// until the page reloads.
const readDismissed = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')

    return Array.isArray(parsed) ? parsed.filter((name) => typeof name === 'string') : []
  } catch {
    return []
  }
}

let dismissed = readDismissed()
const listeners = new Set<() => void>()

const save = (next: string[]) => {
  dismissed = next

  try {
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // Kept in memory for this visit; see readDismissed.
  }

  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)

  return () => listeners.delete(listener)
}

/** Remembered on this device. */
export const useHint = (name: HintName) => {
  const isDismissed = useSyncExternalStore(subscribe, () => dismissed.includes(name))

  return {
    isDismissed,
    dismiss: () => save([...dismissed.filter((other) => other !== name), name]),
  }
}

/** Every hint closed on this device, brought back at once. */
export const useClosedHints = () => {
  const count = useSyncExternalStore(subscribe, () => dismissed.length)

  return { count, restoreAll: () => save([]) }
}
