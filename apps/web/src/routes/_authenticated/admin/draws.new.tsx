import { createFileRoute } from '@tanstack/react-router'
import { usersQuery } from '@/admin/api/admin'
import { NewDrawScreen } from '@/admin/components/NewDrawScreen'

export const Route = createFileRoute('/_authenticated/admin/draws/new')({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery),
  component: NewDrawScreen,
})
