import { useTranslation } from 'react-i18next'
import type { Draw } from '@/draws/api/draws'
import { dateLabelOf, moneyLabelOf } from '@/formatting/labels'
import { Card } from '@/ui/components/Card'
import { Note } from '@/ui/components/Note'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { ParticipantList } from '../ParticipantList'
import { StatusBadge } from '../StatusBadge'
import classes from './WaitingDraw.module.css'

type Props = {
  draw: Draw
}

export const WaitingDraw = ({ draw }: Props) => {
  const { t } = useTranslation()

  return (
    <>
      <Card>
        <dl className={classes.details}>
          <div className={classes.row}>
            <dt>{t('draws.draw.status')}</dt>
            <dd>
              <StatusBadge mode={draw.mode} status={draw.status} />
            </dd>
          </div>
          <div className={classes.row}>
            <dt>{t('draws.meta.eventDate')}</dt>
            <dd>{dateLabelOf(draw.eventDate)}</dd>
          </div>
          {draw.budget === null ? null : (
            <div className={classes.row}>
              <dt>{t('draws.meta.budget')}</dt>
              <dd>{moneyLabelOf(draw.budget)}</dd>
            </div>
          )}
        </dl>
      </Card>
      <Note>{t(`draws.draw.waitingNote.${draw.mode}`)}</Note>
      <SectionLabel>
        {t('draws.draw.participants', { count: draw.participants.length })}
      </SectionLabel>
      <ParticipantList participants={draw.participants} />
    </>
  )
}
