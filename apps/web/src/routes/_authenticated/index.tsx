import { createFileRoute } from '@tanstack/react-router'
import { drawsQuery } from '@/draws/api/draws'
import { StartScreen } from '@/draws/components/StartScreen'
import { wishlistQuery } from '@/wishlist/api/wishlist'

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(drawsQuery),
      context.queryClient.ensureQueryData(wishlistQuery),
    ]),
  component: StartScreen,
})
