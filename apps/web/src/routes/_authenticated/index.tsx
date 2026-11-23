import { createFileRoute } from '@tanstack/react-router'
import { drawsQuery } from '@/draws/api/draws'
import { StartScreen } from '@/draws/components/StartScreen'
import { managedListsQuery } from '@/managers/api/managers'
import { wishlistQuery } from '@/wishlist/api/wishlist'

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(drawsQuery),
      context.queryClient.ensureQueryData(wishlistQuery),
      context.queryClient.ensureQueryData(managedListsQuery),
    ]),
  component: StartScreen,
})
