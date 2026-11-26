import type { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { PendingScreen } from '@/shell/components/PendingScreen'
import { routeTree } from './routeTree.gen'

export const createAppRouter = (queryClient: QueryClient) =>
  createRouter({
    routeTree,
    context: { queryClient },
    defaultPendingComponent: PendingScreen,
    defaultPendingMs: 300,
  })

export type AppRouter = ReturnType<typeof createAppRouter>
