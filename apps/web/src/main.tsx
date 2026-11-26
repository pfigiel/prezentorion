import '@/ui/styles.css'
import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { onSignedOut, onUserChanged } from '@/auth/api/session'
import { listenForInstallPrompt } from '@/install/hooks/install-dialog'
import { identifyUser, reportError, reportReactError, startMonitoring } from '@/monitoring'
import { createAppRouter } from '@/routing/router'
import { dismissSplash } from '@/shell/utils/dismiss-splash'
import { App } from './App'

startMonitoring()
listenForInstallPrompt()

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')

// Declared here because App.tsx is a Fast Refresh boundary, so a hot update would rebuild these and blank the page.
const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: reportError }),
  mutationCache: new MutationCache({ onError: reportError }),
})
const router = createAppRouter(queryClient)
dismissSplash(router)

const forgetUser = () => {
  queryClient.clear()
  void router.invalidate()
}

onUserChanged(identifyUser)
onSignedOut(forgetUser)

createRoot(container, {
  onUncaughtError: reportReactError,
  onCaughtError: reportReactError,
  onRecoverableError: reportReactError,
}).render(
  <StrictMode>
    <App queryClient={queryClient} router={router} />
  </StrictMode>,
)
