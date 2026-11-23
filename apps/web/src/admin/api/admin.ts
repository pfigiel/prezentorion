import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'
import type { Person, Status } from '@/draws/api/draws'

export type AdminDrawSummary = {
  id: string
  name: string
  eventDate: string
  budget: number | null
  status: Status
  participantCount: number
  revealedCount: number
}

export type AdminDraw = {
  id: string
  name: string
  eventDate: string
  budget: number | null
  status: Status
  drawnAt: string | null
  participants: (Person & { hasRevealed: boolean })[]
  excludedPairs: ExcludedPair[]
}

/** Two participants' addresses; neither of them draws the other. */
export type ExcludedPair = [string, string]

export type DrawFields = {
  name: string
  eventDate: string
  budget: number | null
  emails: string[]
  excludedPairs: ExcludedPair[]
}

export type Assignment = {
  giver: Person
  recipient: Person
}

/** An account, or with a null id an address added to a draw that has not signed in yet. */
export type User = {
  id: string | null
  email: string
  name: string | null
  pictureUrl: string | null
  signsInWithPassword: boolean
  signsInWithGoogle: boolean
  drawCount: number
}

export const adminDrawsQuery = queryOptions({
  queryKey: ['admin', 'draws'],
  queryFn: () => fetchApi<AdminDrawSummary[]>('/admin/draws'),
})

export const adminDrawQuery = (drawId: string) =>
  queryOptions({
    queryKey: ['admin', 'draws', drawId],
    queryFn: () => fetchApi<AdminDraw>(`/admin/draws/${drawId}`),
  })

/** Never cached: the screen showing them hides them again as soon as it is left. */
export const assignmentsQuery = (drawId: string) =>
  queryOptions({
    queryKey: ['admin', 'draws', drawId, 'assignments'],
    queryFn: () => fetchApi<Assignment[]>(`/admin/draws/${drawId}/assignments`),
    gcTime: 0,
  })

export const usersQuery = queryOptions({
  queryKey: ['admin', 'users'],
  queryFn: () => fetchApi<User[]>('/admin/users'),
})

export const createDraw = (fields: DrawFields) =>
  fetchApi<{ id: string }>('/admin/draws', { method: 'POST', body: fields })

export const updateDraw = (drawId: string, fields: DrawFields) =>
  fetchApi(`/admin/draws/${drawId}`, { method: 'PUT', body: fields })

export const deleteDraw = (drawId: string) =>
  fetchApi(`/admin/draws/${drawId}`, { method: 'DELETE' })

export const runDraw = (drawId: string) =>
  fetchApi(`/admin/draws/${drawId}/run`, { method: 'POST' })

export const finishDraw = (drawId: string) =>
  fetchApi(`/admin/draws/${drawId}/finish`, { method: 'POST' })

export const setUserPassword = (userId: string, password: string) =>
  fetchApi(`/admin/users/${userId}/password`, { method: 'PUT', body: { password } })
