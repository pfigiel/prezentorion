import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '@/auth/api/session'
import { LoginScreen } from '@/auth/components/LoginScreen'

export const Route = createFileRoute('/login')({
  beforeLoad: async () => {
    if ((await getSession()) !== null) throw redirect({ to: '/' })
  },
  component: LoginScreen,
})
