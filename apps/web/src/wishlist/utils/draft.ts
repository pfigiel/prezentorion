import type { Item, ItemFields } from '@/wishlist/api/wishlist'

/** The photo as the form holds it: none, the one already stored, or a file picked but not uploaded. */
export type Photo =
  { kind: 'none' } | { kind: 'stored'; path: string } | { kind: 'picked'; file: File }

export type Draft = {
  name: string
  url: string
  price: string
  note: string
  priority: number
  photo: Photo
}

export type DraftErrors = {
  url?: 'url'
  price?: 'price'
}

const defaultPriority = 2

export const draftOf = (item: Item | undefined): Draft => ({
  name: item?.name ?? '',
  url: item?.url ?? '',
  price: item?.price === null || item?.price === undefined ? '' : String(item.price),
  note: item?.note ?? '',
  priority: item?.priority ?? defaultPriority,
  photo:
    item?.photoPath === null || item?.photoPath === undefined
      ? { kind: 'none' }
      : { kind: 'stored', path: item.photoPath },
})

/** A link typed without its scheme, as people paste them from the address bar, gets https. */
const urlOf = (text: string) => {
  const trimmed = text.trim()

  if (trimmed === '') return null

  const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`

  if (!URL.canParse(candidate)) return undefined

  const { protocol } = new URL(candidate)

  return protocol === 'http:' || protocol === 'https:' ? candidate : undefined
}

const priceOf = (text: string) => {
  const trimmed = text.trim()

  if (trimmed === '') return null

  return /^\d{1,7}$/.test(trimmed) ? Number(trimmed) : undefined
}

const textOf = (text: string) => (text.trim() === '' ? null : text.trim())

export const errorsOf = (draft: Draft): DraftErrors => ({
  ...(urlOf(draft.url) === undefined ? { url: 'url' } : {}),
  ...(priceOf(draft.price) === undefined ? { price: 'price' } : {}),
})

/** Assumes `errorsOf` found nothing; `photoPath` is where the photo ended up after any upload. */
export const fieldsOf = (draft: Draft, photoPath: string | null): ItemFields => ({
  name: draft.name.trim(),
  url: urlOf(draft.url) ?? null,
  price: priceOf(draft.price) ?? null,
  note: textOf(draft.note),
  priority: draft.priority,
  photoPath,
})
