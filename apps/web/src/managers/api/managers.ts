import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'

/** Someone the owner gave their list to, known to the owner only by the address they typed. */
export type Manager = {
  id: string
  email: string
}

export type ListOwner = {
  id: string
  name: string
  pictureUrl: string | null
}

/** A draw of the owner's whose event has not passed, which a purchase can be filed under. */
type OwnerDraw = {
  id: string
  name: string
  eventDate: string
}

export type ManagedItem = {
  id: string
  name: string
  url: string | null
  price: number | null
  note: string | null
  priority: number
  photoPath: string | null
  repeatable: boolean
  purchasedBy: 'me' | 'other' | null
  /** How many people other than the viewer have bought it. */
  otherBuyers: number
}

export type ManagedList = {
  owner: ListOwner
  draws: OwnerDraw[]
  items: ManagedItem[]
}

export const managersQuery = queryOptions({
  queryKey: ['managers'],
  queryFn: () => fetchApi<Manager[]>('/managers'),
})

export const addManager = (email: string) =>
  fetchApi<{ id: string }>('/managers', { method: 'POST', body: { email } })

export const removeManager = (managerId: string) =>
  fetchApi(`/managers/${managerId}`, { method: 'DELETE' })

export const managedListsQuery = queryOptions({
  queryKey: ['managed-lists'],
  queryFn: () => fetchApi<ListOwner[]>('/managers/lists'),
})

export const managedListQuery = (ownerId: string) =>
  queryOptions({
    queryKey: ['managed-lists', ownerId],
    queryFn: () => fetchApi<ManagedList>(`/managers/lists/${ownerId}`),
  })

export const setManagedPurchase = (
  ownerId: string,
  itemId: string,
  purchase: { purchased: boolean; drawId: string | null },
) => fetchApi(`/managers/lists/${ownerId}/purchases/${itemId}`, { method: 'PUT', body: purchase })
