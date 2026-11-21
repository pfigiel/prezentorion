import { createFileRoute } from '@tanstack/react-router'
import { usersQuery } from '@/admin/api/admin'
import { UsersScreen } from '@/admin/components/UsersScreen'

export const Route = createFileRoute('/_authenticated/admin/users')({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery),
  component: UsersScreen,
})
