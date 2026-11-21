import { createFileRoute } from '@tanstack/react-router'
import { wishlistQuery } from '@/wishlist/api/wishlist'
import { EditItemScreen } from '@/wishlist/components/EditItemScreen'

const EditItemRoute = () => {
  const { itemId } = Route.useParams()

  return <EditItemScreen itemId={itemId} />
}

export const Route = createFileRoute('/_authenticated/wishlist/$itemId/edit')({
  loader: ({ context }) => context.queryClient.ensureQueryData(wishlistQuery),
  component: EditItemRoute,
})
