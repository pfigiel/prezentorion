import type { ExcludedPair } from '@/admin/api/admin'

/** The same for a pair whichever way round it is written. */
export const pairKeyOf = (pair: ExcludedPair) => [...pair].sort().join(' ')
