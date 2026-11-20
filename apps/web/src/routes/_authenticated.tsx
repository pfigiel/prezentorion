import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { accountQuery } from '@/account/api/account-query'
import { getSession } from '@/auth/api/session'
import { Shell } from '@/shell/components/Shell'

const AuthenticatedRoute = () => (
  <Shell>
    <Outlet />
  </Shell>
)

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if ((await getSession()) === null) throw redirect({ to: '/login' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  component: AuthenticatedRoute,
})
