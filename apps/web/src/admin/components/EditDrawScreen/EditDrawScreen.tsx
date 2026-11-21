import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { adminDrawQuery } from '@/admin/api/admin'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { DrawForm } from '../DrawForm'

type Props = {
  drawId: string
}

export const EditDrawScreen = ({ drawId }: Props) => {
  const { t } = useTranslation()
  const { data: draw } = useSuspenseQuery(adminDrawQuery(drawId))

  return (
    <>
      <ScreenHeader
        title={t('admin.form.editTitle')}
        back={{ to: '/admin/draws/$drawId', params: { drawId } }}
      />
      <DrawForm draw={draw} />
    </>
  )
}
