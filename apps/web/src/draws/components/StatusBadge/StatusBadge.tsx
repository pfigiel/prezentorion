import { useTranslation } from 'react-i18next'
import type { Status } from '@/draws/api/draws'
import { Badge } from '@/ui/components/Badge'

type Props = {
  status: Status
}

const tones = { waiting: 'pending', drawn: 'accent', finished: 'neutral' } as const

export const StatusBadge = ({ status }: Props) => {
  const { t } = useTranslation()

  return <Badge tone={tones[status]}>{t(`draws.status.${status}`)}</Badge>
}
