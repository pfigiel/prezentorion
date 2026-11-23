import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { signOut } from '@/auth/api/session'
import { useClosedHints } from '@/hints/hooks/hints'
import { AvatarMenu } from '@/ui/components/AvatarMenu'

export const AccountMenu = () => {
  const { t } = useTranslation()
  const { data: account } = useSuspenseQuery(accountQuery)
  const closedHints = useClosedHints()

  return (
    <AvatarMenu label={t('account.menu.label')} name={account.name} pictureUrl={account.pictureUrl}>
      {closedHints.count === 0 ? null : (
        <AvatarMenu.Item onClick={closedHints.restoreAll}>
          {t('account.menu.restoreHints')}
        </AvatarMenu.Item>
      )}
      <AvatarMenu.Item onClick={() => void signOut()}>{t('account.menu.signOut')}</AvatarMenu.Item>
    </AvatarMenu>
  )
}
