import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicyScreen } from '@/privacy/components/PrivacyPolicyScreen'

export const Route = createFileRoute('/privacy-policy')({
  component: PrivacyPolicyScreen,
})
