import { useTranslation } from 'react-i18next'
import { localDateOf } from '@/admin/utils/local-date-of'
import type { Status } from '@/draws/api/draws'
import { dayMonthLabelOf } from '@/formatting/labels'
import { Badge } from '@/ui/components/Badge'

type Props = {
  status: Status
  /** Shown beside "Wylosowane" when given, as the day the draw ran. */
  drawnAt?: string | null
}

const tones = { waiting: 'pending', drawn: 'accent', finished: 'neutral' } as const

export const StatusBadge = ({ status, drawnAt }: Props) => {
  const { t } = useTranslation()

  const label =
    status === 'drawn' && drawnAt
      ? t('admin.status.drawnOn', { date: dayMonthLabelOf(localDateOf(drawnAt)) })
      : t(`admin.status.${status}`)

  return <Badge tone={tones[status]}>{label}</Badge>
}
