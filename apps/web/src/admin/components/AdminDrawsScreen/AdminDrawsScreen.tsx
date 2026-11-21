import { IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { adminDrawsQuery } from '@/admin/api/admin'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Button } from '@/ui/components/Button'
import { Note } from '@/ui/components/Note'
import { AdminDrawCard } from '../AdminDrawCard'
import { AdminNav } from '../AdminNav'

export const AdminDrawsScreen = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: draws } = useSuspenseQuery(adminDrawsQuery)

  return (
    <>
      <ScreenHeader title={t('admin.title')} />
      <AdminNav />
      <Button
        icon={<IconPlus stroke={2} aria-hidden />}
        onClick={() => void navigate({ to: '/admin/draws/new' })}
      >
        {t('admin.draws.new')}
      </Button>
      {draws.length === 0 ? (
        <Note>{t('admin.draws.empty')}</Note>
      ) : (
        draws.map((draw) => <AdminDrawCard key={draw.id} draw={draw} />)
      )}
    </>
  )
}
