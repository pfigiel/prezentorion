import { useTranslation } from 'react-i18next'
import { localDateOf } from '@/admin/utils/local-date-of'
import type { Mode, Status } from '@/draws/api/draws'
import { dayMonthLabelOf } from '@/formatting/labels'
import { Badge } from '@/ui/components/Badge'

type Props = {
  mode: Mode
  status: Status
  /** Shown beside "Wylosowane" or "Rozpoczęte" when given, as the day the draw ran. */
  drawnAt?: string | null
}

const tones = { waiting: 'pending', drawn: 'accent', finished: 'neutral' } as const

export const StatusBadge = ({ mode, status, drawnAt }: Props) => {
  const { t } = useTranslation()

  const label =
    status === 'drawn' && drawnAt
      ? t(`admin.status.${mode}.drawnOn`, { date: dayMonthLabelOf(localDateOf(drawnAt)) })
      : t(`admin.status.${mode}.${status}`)

  return <Badge tone={tones[status]}>{label}</Badge>
}
