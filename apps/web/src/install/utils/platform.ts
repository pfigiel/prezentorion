/** How a phone gets the app onto its home screen; a desktop or a tablet is never asked. */
export type InstallWay = 'android' | 'ios' | 'ios-in-app'

const androidPhone = /Android.*Mobile/
// An iPad counts as a desktop, so only the phones are matched.
const iPhone = /iPhone|iPod/
// Safari and every other iOS browser end their agent with this; a browser built into an app does not.
const safari = /Safari\//

export const installWayOf = (userAgent: string): InstallWay | null => {
  if (androidPhone.test(userAgent)) return 'android'
  if (!iPhone.test(userAgent)) return null

  return safari.test(userAgent) ? 'ios' : 'ios-in-app'
}

/** Opened from the home screen rather than a browser tab; iOS reports it through `navigator` alone. */
export const isStandalone = () =>
  ('standalone' in navigator && navigator.standalone === true) ||
  window.matchMedia('(display-mode: standalone)').matches
