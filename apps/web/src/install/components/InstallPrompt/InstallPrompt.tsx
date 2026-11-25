import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { settleInstallPrompt } from '@/install/api/settle-install-prompt'
import { useInstallDialog } from '@/install/hooks/install-dialog'
import { installWayOf, isStandalone } from '@/install/utils/platform'
import { Button } from '@/ui/components/Button'
import { Modal } from '@/ui/components/Modal'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import classes from './InstallPrompt.module.css'

/** Asks a phone to install the app on every load until it is installed or declined for good. */
export const InstallPrompt = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: account } = useSuspenseQuery(accountQuery)
  const [way] = useState(() => installWayOf(navigator.userAgent))
  const [standalone] = useState(isStandalone)
  const dialog = useInstallDialog()
  const [shown, prompt] = useDisclosure(true)
  const { mutate: settle } = useMutation({
    mutationFn: settleInstallPrompt,
    onMutate: () =>
      queryClient.setQueryData(
        accountQuery.queryKey,
        (current) => current && { ...current, installPromptSettled: true },
      ),
  })
  const settled = account.installPromptSettled

  useEffect(() => {
    if (standalone && !settled) settle()
  }, [standalone, settled, settle])

  if (way === null || standalone) return null

  const install = async () => {
    if (await dialog.open()) settle()
  }

  const opened = !settled && shown && (way !== 'android' || dialog.available)

  return (
    <Modal opened={opened} title={t('install.prompt.title')} onClose={prompt.close}>
      {way === 'android' ? t('install.prompt.android.body') : null}
      {way === 'ios' ? (
        <>
          {t('install.prompt.ios.body')}
          <ol className={classes.steps}>
            <li>{t('install.prompt.ios.share')}</li>
            <li>{t('install.prompt.ios.add')}</li>
            <li>{t('install.prompt.ios.confirm')}</li>
          </ol>
        </>
      ) : null}
      {way === 'ios-in-app' ? t('install.prompt.inApp.body') : null}
      <Modal.Actions>
        <Button variant="secondary" size="md" onClick={() => settle()}>
          {t('install.prompt.decline')}
        </Button>
        {way === 'android' ? (
          <Button size="md" onClick={() => void install()}>
            {t('install.prompt.android.install')}
          </Button>
        ) : (
          <Button size="md" onClick={prompt.close}>
            {t('install.prompt.done')}
          </Button>
        )}
      </Modal.Actions>
    </Modal>
  )
}
