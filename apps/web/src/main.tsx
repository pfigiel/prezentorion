import '@/ui/styles.css'
import { QueryClient } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { onSignedOut } from '@/auth/api/session'
import { createAppRouter } from '@/routing/router'
import { App } from './App'

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')

// Declared here because App.tsx is a Fast Refresh boundary, so a hot update would rebuild these and blank the page.
const queryClient = new QueryClient()
const router = createAppRouter(queryClient)

const forgetUser = () => {
  queryClient.clear()
  void router.invalidate()
}

onSignedOut(forgetUser)

createRoot(container).render(
  <StrictMode>
    <App queryClient={queryClient} router={router} />
  </StrictMode>,
)
