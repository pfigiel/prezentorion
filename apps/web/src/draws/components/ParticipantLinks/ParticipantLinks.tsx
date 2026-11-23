import { IconChevronRight } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import type { Draw } from '@/draws/api/draws'
import { Avatar } from '@/ui/components/Avatar'
import { Badge } from '@/ui/components/Badge'
import { Card } from '@/ui/components/Card'
import classes from './ParticipantLinks.module.css'

type Props = {
  drawId: string
  participants: Draw['participants']
}

/** Everyone in an open draw, each leading to their wish list; your own row leads nowhere. */
export const ParticipantLinks = ({ drawId, participants }: Props) => {
  const { t } = useTranslation()

  return (
    <Card quiet className={classes.root}>
      <ul className={classes.list}>
        {participants.map((participant) => {
          const name = participant.name ?? participant.email

          return (
            <li key={participant.id} className={classes.item}>
              {participant.isMe ? (
                <span className={classes.row}>
                  <Avatar name={participant.name} pictureUrl={participant.pictureUrl} />
                  <span className={classes.name}>{name}</span>
                  <Badge tone="neutral">{t('draws.draw.you')}</Badge>
                </span>
              ) : (
                <Link
                  to="/draws/$drawId/participants/$participantId"
                  params={{ drawId, participantId: participant.id }}
                  className={classes.row}
                >
                  <Avatar name={participant.name} pictureUrl={participant.pictureUrl} />
                  <span className={classes.name}>{name}</span>
                  <IconChevronRight stroke={1.8} aria-hidden className={classes.chevron} />
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
