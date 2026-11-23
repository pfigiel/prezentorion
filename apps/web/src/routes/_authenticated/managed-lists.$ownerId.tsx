import { createFileRoute } from '@tanstack/react-router'
import { managedListQuery } from '@/managers/api/managers'
import { ManagedListNotFound } from '@/managers/components/ManagedListNotFound'
import { ManagedListScreen } from '@/managers/components/ManagedListScreen'

const ManagedListRoute = () => <ManagedListScreen ownerId={Route.useParams().ownerId} />

export const Route = createFileRoute('/_authenticated/managed-lists/$ownerId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(managedListQuery(params.ownerId)),
  errorComponent: ManagedListNotFound,
  component: ManagedListRoute,
})
