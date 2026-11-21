import { createFileRoute } from '@tanstack/react-router'
import { adminDrawsQuery } from '@/admin/api/admin'
import { AdminDrawsScreen } from '@/admin/components/AdminDrawsScreen'

export const Route = createFileRoute('/_authenticated/admin/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminDrawsQuery),
  component: AdminDrawsScreen,
})
