import { createFileRoute } from '@tanstack/react-router'
import { AssignmentsScreen } from '@/admin/components/AssignmentsScreen'

// No loader: the assignments are fetched only while this screen shows them, never ahead of it.
const AssignmentsRoute = () => <AssignmentsScreen drawId={Route.useParams().drawId} />

export const Route = createFileRoute('/_authenticated/admin/draws/$drawId/assignments')({
  component: AssignmentsRoute,
})
