import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { Heading } from '@/ui/components/Heading'

export const StartScreen = () => {
  const { t } = useTranslation()
  const { data: account } = useSuspenseQuery(accountQuery)

  return <Heading order={1}>{t('draws.start.greeting', { name: account.name })}</Heading>
}
