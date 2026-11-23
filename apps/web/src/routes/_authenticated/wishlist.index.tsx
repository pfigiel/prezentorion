import { createFileRoute } from '@tanstack/react-router'
import { managedListsQuery } from '@/managers/api/managers'
import { wishlistQuery } from '@/wishlist/api/wishlist'
import { WishlistScreen } from '@/wishlist/components/WishlistScreen'

export const Route = createFileRoute('/_authenticated/wishlist/')({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(wishlistQuery),
      context.queryClient.ensureQueryData(managedListsQuery),
    ]),
  component: WishlistScreen,
})
