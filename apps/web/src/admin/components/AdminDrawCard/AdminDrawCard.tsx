import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { AdminDrawSummary } from '@/admin/api/admin'
import { dateLabelOf, moneyLabelOf } from '@/formatting/labels'
import { Card } from '@/ui/components/Card'
import { StatusBadge } from '../StatusBadge'
import classes from './AdminDrawCard.module.css'

type Props = {
  draw: AdminDrawSummary
}

export const AdminDrawCard = ({ draw }: Props) => {
  const { t } = useTranslation()

  const details = [
    dateLabelOf(draw.eventDate),
    draw.budget === null ? null : moneyLabelOf(draw.budget),
    t('admin.draws.participants', { count: draw.participantCount }),
    draw.status === 'waiting'
      ? null
      : t('admin.draws.revealed', { revealed: draw.revealedCount, total: draw.participantCount }),
  ].filter((detail) => detail !== null)

  return (
    <Link to="/admin/draws/$drawId" params={{ drawId: draw.id }} className={classes.root}>
      <Card quiet={draw.status === 'finished'} className={classes.card}>
        <span className={classes.heading}>
          <span className={classes.name}>{draw.name}</span>
          <StatusBadge status={draw.status} />
        </span>
        <span className={classes.details}>{details.join(' · ')}</span>
      </Card>
    </Link>
  )
}
