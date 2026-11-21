import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'

export type ItemFields = {
  name: string
  url: string | null
  price: number | null
  note: string | null
  priority: number
  photoPath: string | null
}

/** Bought shows only from the event day of the draw it was bought under, never before. */
export type Item = ItemFields & { id: string; isPurchased: boolean }

export const wishlistQuery = queryOptions({
  queryKey: ['wishlist'],
  queryFn: () => fetchApi<Item[]>('/wishlist'),
})

export const createItem = (fields: ItemFields) =>
  fetchApi<{ id: string }>('/wishlist', { method: 'POST', body: fields })

export const updateItem = (itemId: string, fields: ItemFields) =>
  fetchApi(`/wishlist/${itemId}`, { method: 'PUT', body: fields })

export const deleteItem = (itemId: string) => fetchApi(`/wishlist/${itemId}`, { method: 'DELETE' })

export const markAvailable = (itemId: string) =>
  fetchApi(`/wishlist/${itemId}/available`, { method: 'POST' })
