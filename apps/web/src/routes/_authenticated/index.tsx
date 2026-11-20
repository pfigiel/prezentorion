import { createFileRoute } from '@tanstack/react-router'
import { StartScreen } from '@/draws/components/StartScreen'

export const Route = createFileRoute('/_authenticated/')({
  component: StartScreen,
})
