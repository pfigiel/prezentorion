import { useTranslation } from 'react-i18next'
import type { Draw } from '@/draws/api/draws'
import { Hint } from '@/hints/components/Hint'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { DrawMeta } from '../DrawMeta'
import { ParticipantLinks } from '../ParticipantLinks'
import { StatusBadge } from '../StatusBadge'
import classes from './OpenDraw.module.css'

type Props = {
  draw: Draw
}

export const OpenDraw = ({ draw }: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <div className={classes.meta}>
        <DrawMeta
          eventDate={draw.eventDate}
          budget={draw.budget}
          participantCount={draw.participants.length}
        />
        <StatusBadge mode={draw.mode} status={draw.status} />
      </div>
      <Hint name="openDraw">{t('draws.open.note')}</Hint>
      <SectionLabel>
        {t('draws.draw.participants', { count: draw.participants.length })}
      </SectionLabel>
      <ParticipantLinks drawId={draw.id} participants={draw.participants} />
    </>
  )
}
