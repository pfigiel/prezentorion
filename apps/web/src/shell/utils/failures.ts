import type { Mutation, Query } from '@tanstack/react-query'
import { i18n } from '@/i18n'
import { reportError } from '@/monitoring'
import { showErrorToast } from '@/ui/components/Toasts'

const announceFailure = () =>
  showErrorToast({
    message: i18n.t('shell.failure.message'),
    closeLabel: i18n.t('shell.failure.dismiss'),
  })

export const queryFailed = (error: unknown, query: Query<unknown, unknown, unknown>) => {
  reportError(error)

  // A first load that fails is drawn by its route; only a refetch behind data already on screen would fail unseen.
  if (query.state.data !== undefined) announceFailure()
}

export const mutationFailed = (
  error: unknown,
  _variables: unknown,
  _onMutateResult: unknown,
  mutation: Mutation<unknown, unknown, unknown>,
) => {
  reportError(error)

  if (mutation.meta?.showsOwnError !== true) announceFailure()
}
