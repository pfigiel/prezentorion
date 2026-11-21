import { IconCalendar, IconUsers, IconWallet } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { dayMonthLabelOf, moneyLabelOf } from '@/formatting/labels'
import classes from './DrawMeta.module.css'

type Props = {
  eventDate: string
  budget: number | null
  participantCount: number
}

export const DrawMeta = ({ eventDate, budget, participantCount }: Props) => {
  const { t } = useTranslation()

  return (
    <dl className={classes.root}>
      <div className={classes.entry}>
        <dt>
          <IconCalendar stroke={1.8} aria-label={t('draws.meta.eventDate')} />
        </dt>
        <dd>{dayMonthLabelOf(eventDate)}</dd>
      </div>
      {budget === null ? null : (
        <div className={classes.entry}>
          <dt>
            <IconWallet stroke={1.8} aria-label={t('draws.meta.budget')} />
          </dt>
          <dd>{moneyLabelOf(budget)}</dd>
        </div>
      )}
      <div className={classes.entry}>
        <dt>
          <IconUsers stroke={1.8} aria-label={t('draws.meta.participants')} />
        </dt>
        <dd>{participantCount}</dd>
      </div>
    </dl>
  )
}
