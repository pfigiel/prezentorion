import { IconChevronRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { DrawSummary } from '@/draws/api/draws'
import { Avatar } from '@/ui/components/Avatar'
import { ButtonLink } from '@/ui/components/ButtonLink'
import { Card } from '@/ui/components/Card'
import { Heading } from '@/ui/components/Heading'
import { DrawMeta } from '../DrawMeta'
import { StarIcon } from '../StarIcon'
import { StatusBadge } from '../StatusBadge'
import classes from './DrawCard.module.css'

type Props = {
  draw: DrawSummary
}

export const DrawCard = ({ draw }: Props) => {
  const { t } = useTranslation()
  const params = { drawId: draw.id }

  const action = () => {
    if (draw.recipient !== null) {
      return (
        <Link to="/draws/$drawId" params={params} className={classes.recipient}>
          <Avatar name={draw.recipient.name} pictureUrl={draw.recipient.pictureUrl} />
          <span className={classes.recipientText}>
            <span className={classes.caption}>{t('draws.card.buyingFor')}</span>
            <span className={classes.name}>{draw.recipient.name ?? draw.recipient.email}</span>
          </span>
          <IconChevronRight stroke={1.8} aria-hidden className={classes.chevron} />
        </Link>
      )
    }

    if (draw.status === 'waiting') {
      return (
        <ButtonLink
          variant="secondary"
          renderLink={(props) => <Link {...props} to="/draws/$drawId" params={params} />}
        >
          {t('draws.card.details')}
        </ButtonLink>
      )
    }

    return (
      <ButtonLink
        icon={<StarIcon className={classes.star} />}
        renderLink={(props) => <Link {...props} to="/draws/$drawId" params={params} />}
      >
        {t('draws.card.reveal')}
      </ButtonLink>
    )
  }

  return (
    <Card quiet={draw.status === 'waiting'}>
      <div className={classes.heading}>
        <Heading order={3} size="sm">
          {draw.name}
        </Heading>
        <StatusBadge status={draw.status} />
      </div>
      <DrawMeta
        eventDate={draw.eventDate}
        budget={draw.budget}
        participantCount={draw.participantCount}
      />
      {action()}
    </Card>
  )
}
