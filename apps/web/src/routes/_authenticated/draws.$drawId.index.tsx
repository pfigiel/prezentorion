import { createFileRoute } from '@tanstack/react-router'
import { drawQuery, recipientWishlistQuery } from '@/draws/api/draws'
import { DrawNotFound } from '@/draws/components/DrawNotFound'
import { DrawScreen } from '@/draws/components/DrawScreen'

const DrawRoute = () => <DrawScreen drawId={Route.useParams().drawId} />

export const Route = createFileRoute('/_authenticated/draws/$drawId/')({
  loader: async ({ context, params }) => {
    const draw = await context.queryClient.ensureQueryData(drawQuery(params.drawId))

    if (draw.recipient !== null) {
      await context.queryClient.ensureQueryData(recipientWishlistQuery(params.drawId))
    }
  },
  errorComponent: DrawNotFound,
  component: DrawRoute,
})
