import { useTranslation } from 'react-i18next'
import type { Draw } from '@/draws/api/draws'
import { Avatar } from '@/ui/components/Avatar'
import { Badge } from '@/ui/components/Badge'
import { Card } from '@/ui/components/Card'
import classes from './ParticipantList.module.css'

type Props = {
  participants: Draw['participants']
}

export const ParticipantList = ({ participants }: Props) => {
  const { t } = useTranslation()

  return (
    <Card quiet className={classes.root}>
      <ul className={classes.list}>
        {participants.map((participant) => (
          <li key={participant.id} className={classes.row}>
            <Avatar name={participant.name} pictureUrl={participant.pictureUrl} />
            <span className={classes.name}>{participant.name ?? participant.email}</span>
            {participant.isMe ? <Badge tone="neutral">{t('draws.draw.you')}</Badge> : null}
          </li>
        ))}
      </ul>
    </Card>
  )
}
