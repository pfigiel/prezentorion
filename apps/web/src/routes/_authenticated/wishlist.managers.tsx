import { createFileRoute } from '@tanstack/react-router'
import { managersQuery } from '@/managers/api/managers'
import { ManagersScreen } from '@/managers/components/ManagersScreen'

export const Route = createFileRoute('/_authenticated/wishlist/managers')({
  loader: ({ context }) => context.queryClient.ensureQueryData(managersQuery),
  component: ManagersScreen,
})
