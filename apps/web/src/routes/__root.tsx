import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { StarrySky } from '@/ui/components/StarrySky'

type RouterContext = { queryClient: QueryClient }

const RootRoute = () => (
  <>
    <StarrySky />
    <Outlet />
    {import.meta.env.DEV ? <TanStackRouterDevtools position="bottom-right" /> : null}
  </>
)

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootRoute,
})
