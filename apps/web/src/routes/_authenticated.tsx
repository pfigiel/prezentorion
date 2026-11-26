import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { accountQuery } from '@/account/api/account-query'
import { getSession } from '@/auth/api/session'
import { PendingScreen } from '@/shell/components/PendingScreen'
import { Shell } from '@/shell/components/Shell'
import { PageColumn } from '@/ui/components/PageColumn'

const AuthenticatedRoute = () => (
  <Shell>
    <Outlet />
  </Shell>
)

// The shell needs the account this route is still loading, so until then the column stands alone.
const PendingRoute = () => (
  <PageColumn>
    <PendingScreen />
  </PageColumn>
)

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    if ((await getSession()) === null) throw redirect({ to: '/login' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  component: AuthenticatedRoute,
  pendingComponent: PendingRoute,
})
