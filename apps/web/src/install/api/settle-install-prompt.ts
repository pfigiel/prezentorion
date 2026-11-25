import { fetchApi } from '@/auth/api/fetch-api'

export const settleInstallPrompt = () =>
  fetchApi('/account/install-prompt/settle', { method: 'POST' })
