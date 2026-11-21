import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'

export type Status = 'waiting' | 'drawn' | 'finished'

/** Someone known only by their address until they first sign in, when name and picture appear. */
export type Person = {
  id: string
  email: string
  name: string | null
  pictureUrl: string | null
}

export type DrawSummary = {
  id: string
  name: string
  eventDate: string
  budget: number | null
  status: Status
  participantCount: number
  recipient: Person | null
}

export type Draw = {
  id: string
  name: string
  eventDate: string
  budget: number | null
  status: Status
  participants: (Person & { isMe: boolean })[]
  recipient: Person | null
}

export type RecipientItem = {
  id: string
  name: string
  url: string | null
  price: number | null
  note: string | null
  priority: number
  photoPath: string | null
  purchasedBy: 'me' | 'other' | null
}

export const drawsQuery = queryOptions({
  queryKey: ['draws'],
  queryFn: () => fetchApi<DrawSummary[]>('/draws'),
})

export const drawQuery = (drawId: string) =>
  queryOptions({
    queryKey: ['draws', drawId],
    queryFn: () => fetchApi<Draw>(`/draws/${drawId}`),
  })

export const recipientWishlistQuery = (drawId: string) =>
  queryOptions({
    queryKey: ['draws', drawId, 'wishlist'],
    queryFn: () => fetchApi<RecipientItem[]>(`/draws/${drawId}/wishlist`),
  })

export const revealRecipient = (drawId: string) =>
  fetchApi(`/draws/${drawId}/reveal`, { method: 'POST' })

export const setPurchased = (drawId: string, itemId: string, purchased: boolean) =>
  fetchApi(`/draws/${drawId}/purchases/${itemId}`, { method: 'PUT', body: { purchased } })
