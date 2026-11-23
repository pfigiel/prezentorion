import { createFileRoute } from '@tanstack/react-router'
import { drawQuery, participantWishlistQuery } from '@/draws/api/draws'
import { DrawNotFound } from '@/draws/components/DrawNotFound'
import { ParticipantScreen } from '@/draws/components/ParticipantScreen'

const ParticipantRoute = () => {
  const { drawId, participantId } = Route.useParams()

  return <ParticipantScreen drawId={drawId} participantId={participantId} />
}

export const Route = createFileRoute('/_authenticated/draws/$drawId/participants/$participantId')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(drawQuery(params.drawId)),
      context.queryClient.ensureQueryData(
        participantWishlistQuery(params.drawId, params.participantId),
      ),
    ]),
  errorComponent: DrawNotFound,
  component: ParticipantRoute,
})
