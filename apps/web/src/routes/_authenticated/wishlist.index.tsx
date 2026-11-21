import { createFileRoute } from '@tanstack/react-router'
import { wishlistQuery } from '@/wishlist/api/wishlist'
import { WishlistScreen } from '@/wishlist/components/WishlistScreen'

export const Route = createFileRoute('/_authenticated/wishlist/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(wishlistQuery),
  component: WishlistScreen,
})
