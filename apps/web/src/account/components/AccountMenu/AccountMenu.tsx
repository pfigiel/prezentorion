import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { signOut } from '@/auth/api/session'
import { AvatarMenu } from '@/ui/components/AvatarMenu'

export const AccountMenu = () => {
  const { t } = useTranslation()
  const { data: account } = useSuspenseQuery(accountQuery)

  return (
    <AvatarMenu label={t('account.menu.label')} name={account.name} pictureUrl={account.pictureUrl}>
      <AvatarMenu.Item onClick={() => void signOut()}>{t('account.menu.signOut')}</AvatarMenu.Item>
    </AvatarMenu>
  )
}
