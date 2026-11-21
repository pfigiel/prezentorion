import { createFileRoute, redirect } from '@tanstack/react-router'
import { accountQuery } from '@/account/api/account-query'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: async ({ context }) => {
    const account = await context.queryClient.ensureQueryData(accountQuery)

    if (!account.isAdmin) throw redirect({ to: '/' })
  },
})
