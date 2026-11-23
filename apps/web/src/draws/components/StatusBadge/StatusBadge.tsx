import { useTranslation } from 'react-i18next'
import type { Mode, Status } from '@/draws/api/draws'
import { Badge } from '@/ui/components/Badge'

type Props = {
  mode: Mode
  status: Status
}

const tones = { waiting: 'pending', drawn: 'accent', finished: 'neutral' } as const

export const StatusBadge = ({ mode, status }: Props) => {
  const { t } = useTranslation()

  return <Badge tone={tones[status]}>{t(`draws.status.${mode}.${status}`)}</Badge>
}
