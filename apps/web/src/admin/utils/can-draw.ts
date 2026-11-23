import type { ExcludedPair } from '@/admin/api/admin'
import { pairKeyOf } from './pair-key-of'

/** Whether a draw exists: a perfect matching of givers to allowed recipients, by augmenting paths. */
export const canDraw = (emails: string[], excludedPairs: ExcludedPair[]) => {
  const excluded = new Set(excludedPairs.map(pairKeyOf))
  const giverOf = new Map<string, string>()

  const assign = (giver: string, visited: Set<string>): boolean =>
    emails.some((recipient) => {
      if (recipient === giver || visited.has(recipient)) return false
      if (excluded.has(pairKeyOf([giver, recipient]))) return false

      visited.add(recipient)
      const current = giverOf.get(recipient)

      if (current !== undefined && !assign(current, visited)) return false

      giverOf.set(recipient, giver)

      return true
    })

  return emails.every((giver) => assign(giver, new Set()))
}
