import clsx from 'clsx'
import { useTranslation } from 'react-i18next'
import type { Draw, Person } from '@/draws/api/draws'
import { dateLabelOf, moneyLabelOf } from '@/formatting/labels'
import { Avatar } from '@/ui/components/Avatar'
import { Card } from '@/ui/components/Card'
import classes from './RecipientCard.module.css'

type Props = {
  draw: Draw
  recipient: Person
  /** Grows out of the reveal tile it replaces, which only happens on the reveal itself. */
  justRevealed: boolean
}

export const RecipientCard = ({ draw, recipient, justRevealed }: Props) => {
  const { t } = useTranslation()
  const date = dateLabelOf(draw.eventDate)

  return (
    <Card className={clsx(classes.root, justRevealed && classes.settling)}>
      <Avatar
        name={recipient.name}
        pictureUrl={recipient.pictureUrl}
        size="lg"
        className={classes.avatar}
      />
      <div className={classes.text}>
        <span className={classes.caption}>{t('draws.recipient.buyingFor')}</span>
        <span className={classes.name}>{recipient.name ?? recipient.email}</span>
        <span className={classes.caption}>
          {draw.budget === null
            ? t('draws.recipient.date', { date })
            : t('draws.recipient.budgetAndDate', { budget: moneyLabelOf(draw.budget), date })}
        </span>
      </div>
    </Card>
  )
}
