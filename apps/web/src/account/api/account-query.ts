import { queryOptions } from '@tanstack/react-query'
import { fetchApi } from '@/auth/api/fetch-api'

export type Account = {
  id: string
  email: string
  name: string
  pictureUrl: string | null
  isAdmin: boolean
}

export const accountQuery = queryOptions({
  queryKey: ['account'],
  queryFn: () => fetchApi<Account>('/account'),
})
