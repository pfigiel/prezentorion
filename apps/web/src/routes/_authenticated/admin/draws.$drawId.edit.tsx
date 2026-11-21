import { createFileRoute } from '@tanstack/react-router'
import { adminDrawQuery, usersQuery } from '@/admin/api/admin'
import { EditDrawScreen } from '@/admin/components/EditDrawScreen'

const EditDrawRoute = () => <EditDrawScreen drawId={Route.useParams().drawId} />

export const Route = createFileRoute('/_authenticated/admin/draws/$drawId/edit')({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(adminDrawQuery(params.drawId)),
      context.queryClient.ensureQueryData(usersQuery),
    ]),
  component: EditDrawRoute,
})
