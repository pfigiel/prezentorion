import { createFileRoute } from '@tanstack/react-router'
import { adminDrawQuery } from '@/admin/api/admin'
import { DrawPanelScreen } from '@/admin/components/DrawPanelScreen'

const DrawPanelRoute = () => <DrawPanelScreen drawId={Route.useParams().drawId} />

export const Route = createFileRoute('/_authenticated/admin/draws/$drawId/')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(adminDrawQuery(params.drawId)),
  component: DrawPanelRoute,
})
