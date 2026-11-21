import { useTranslation } from 'react-i18next'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { DrawForm } from '../DrawForm'

export const NewDrawScreen = () => {
  const { t } = useTranslation()

  return (
    <>
      <ScreenHeader title={t('admin.form.newTitle')} back={{ to: '/admin' }} />
      <DrawForm />
    </>
  )
}
