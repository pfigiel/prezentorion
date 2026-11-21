import { IconCircleCheck, IconEye, IconRefresh } from '@tabler/icons-react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { adminDrawQuery, runDraw } from '@/admin/api/admin'
import { minimumParticipants } from '@/admin/constants/draws'
import { displayNameOf } from '@/admin/utils/display-name-of'
import { dateLabelOf, moneyLabelOf } from '@/formatting/labels'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Avatar } from '@/ui/components/Avatar'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Modal } from '@/ui/components/Modal'
import { Note } from '@/ui/components/Note'
import { Progress } from '@/ui/components/Progress'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import { StatusBadge } from '../StatusBadge'
import classes from './DrawPanelScreen.module.css'

type Props = {
  drawId: string
}

export const DrawPanelScreen = ({ drawId }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: account } = useSuspenseQuery(accountQuery)
  const { data: draw } = useSuspenseQuery(adminDrawQuery(drawId))
  const [redrawOpened, redraw] = useDisclosure(false)
  const [spoilerOpened, spoiler] = useDisclosure(false)

  const run = useMutation({
    mutationFn: () => runDraw(drawId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['draws'] }),
      ])
      redraw.close()
    },
  })

  const isDrawn = draw.status !== 'waiting'
  const revealedCount = draw.participants.filter(({ hasRevealed }) => hasRevealed).length
  const dateAndBudget = [
    dateLabelOf(draw.eventDate),
    draw.budget === null ? null : moneyLabelOf(draw.budget),
  ]
    .filter((part) => part !== null)
    .join(' · ')

  const showAssignments = () => {
    spoiler.close()
    void navigate({ to: '/admin/draws/$drawId/assignments', params: { drawId } })
  }

  return (
    <>
      <ScreenHeader
        title={draw.name}
        back={{ to: '/admin' }}
        action={
          <Link to="/admin/draws/$drawId/edit" params={{ drawId }} className={classes.edit}>
            {t('admin.panel.edit')}
          </Link>
        }
      />
      <Card>
        <div className={classes.fact}>
          <span className={classes.factLabel}>{t('admin.panel.status')}</span>
          <StatusBadge status={draw.status} drawnAt={draw.drawnAt} />
        </div>
        <div className={classes.fact}>
          <span className={classes.factLabel}>{t('admin.panel.dateAndBudget')}</span>
          <span>{dateAndBudget}</span>
        </div>
        {isDrawn ? (
          <>
            <div className={classes.fact}>
              <span className={classes.factLabel}>{t('admin.panel.revealedResults')}</span>
              <span>
                {revealedCount}/{draw.participants.length}
              </span>
            </div>
            <Progress
              label={t('admin.panel.revealedResults')}
              value={revealedCount}
              max={draw.participants.length}
            />
          </>
        ) : null}
      </Card>
      <SectionLabel>
        {t('admin.panel.participants', { count: draw.participants.length })}
      </SectionLabel>
      <Card quiet className={classes.list}>
        <ul className={classes.rows}>
          {draw.participants.map((participant) => (
            <li key={participant.id} className={classes.row}>
              <Avatar name={participant.name} pictureUrl={participant.pictureUrl} />
              <span className={classes.name}>
                {participant.email === account.email
                  ? t('admin.form.you', { name: displayNameOf(participant) })
                  : displayNameOf(participant)}
              </span>
              {!isDrawn ? null : participant.hasRevealed ? (
                <span className={classes.revealed}>
                  <IconCircleCheck stroke={1.8} aria-hidden />
                  {t('admin.panel.revealed')}
                </span>
              ) : (
                <span className={classes.notRevealed}>{t('admin.panel.notRevealed')}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
      {run.isError ? <p className={classes.error}>{t('admin.panel.failed')}</p> : null}
      {isDrawn ? (
        <div className={classes.actions}>
          <Button
            variant="secondary"
            size="md"
            icon={<IconRefresh stroke={1.8} aria-hidden />}
            onClick={redraw.open}
          >
            {t('admin.panel.redraw')}
          </Button>
          <button type="button" className={classes.textButton} onClick={spoiler.open}>
            <IconEye stroke={1.8} aria-hidden />
            {t('admin.panel.showAssignments')}
          </button>
        </div>
      ) : (
        <>
          {draw.participants.length < minimumParticipants ? (
            <Note>{t('admin.panel.tooFew')}</Note>
          ) : null}
          <Button
            disabled={draw.participants.length < minimumParticipants}
            loading={run.isPending}
            onClick={() => run.mutate()}
          >
            {t('admin.panel.run')}
          </Button>
        </>
      )}
      <Modal opened={redrawOpened} title={t('admin.panel.redrawTitle')} onClose={redraw.close}>
        {t('admin.panel.redrawWarning')}
        <Modal.Actions>
          <Button variant="secondary" size="md" onClick={redraw.close}>
            {t('admin.panel.cancel')}
          </Button>
          <Button size="md" loading={run.isPending} onClick={() => run.mutate()}>
            {t('admin.panel.redraw')}
          </Button>
        </Modal.Actions>
      </Modal>
      <Modal opened={spoilerOpened} title={t('admin.panel.spoilerTitle')} onClose={spoiler.close}>
        {t('admin.panel.spoilerWarning')}
        <Modal.Actions>
          <Button variant="secondary" size="md" onClick={spoiler.close}>
            {t('admin.panel.cancel')}
          </Button>
          <Button size="md" onClick={showAssignments}>
            {t('admin.panel.show')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}
