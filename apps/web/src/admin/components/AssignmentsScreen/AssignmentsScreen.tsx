import { IconArrowRight } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { assignmentsQuery } from '@/admin/api/admin'
import { displayNameOf } from '@/admin/utils/display-name-of'
import { Hint } from '@/hints/components/Hint'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import classes from './AssignmentsScreen.module.css'

type Props = {
  drawId: string
}

export const AssignmentsScreen = ({ drawId }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: assignments } = useSuspenseQuery(assignmentsQuery(drawId))

  return (
    <>
      <ScreenHeader
        title={t('admin.assignments.title')}
        back={{ to: '/admin/draws/$drawId', params: { drawId } }}
      />
      <Hint name="assignments">{t('admin.assignments.note')}</Hint>
      <Card quiet className={classes.list}>
        <ul className={classes.rows}>
          {assignments.map(({ giver, recipient }) => (
            <li key={giver.id} className={classes.row}>
              <span className={classes.giver}>{displayNameOf(giver)}</span>
              <IconArrowRight
                stroke={1.8}
                role="img"
                aria-label={t('admin.assignments.buysFor')}
                className={classes.arrow}
              />
              <span className={classes.recipient}>{displayNameOf(recipient)}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Button
        className={classes.hide}
        onClick={() => void navigate({ to: '/admin/draws/$drawId', params: { drawId } })}
      >
        {t('admin.assignments.hide')}
      </Button>
    </>
  )
}
