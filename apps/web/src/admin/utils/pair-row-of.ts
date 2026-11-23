import type { ExcludedPair } from '@/admin/api/admin'

/** A pair as the admin fills it in: either side stays null until someone is picked for it. */
export type PairRow = {
  id: string
  first: string | null
  second: string | null
}

export const pairRowOf = (
  [first, second]: [string | null, string | null] = [null, null],
): PairRow => ({
  id: crypto.randomUUID(),
  first,
  second,
})

export const completePairsOf = (rows: PairRow[]) =>
  rows.flatMap(({ first, second }): ExcludedPair[] =>
    first === null || second === null ? [] : [[first, second]],
  )
