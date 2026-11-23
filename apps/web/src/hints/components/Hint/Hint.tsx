import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useHint, type HintName } from '@/hints/hooks/hints'
import { Collapse } from '@/ui/components/Collapse'
import { Note } from '@/ui/components/Note'

type Props = {
  name: HintName
  children: ReactNode
}

/** A note explaining a screen, which folds away once closed until the account menu restores it. */
export const Hint = ({ name, children }: Props) => {
  const { t } = useTranslation()
  const hint = useHint(name)

  return (
    <Collapse opened={!hint.isDismissed}>
      <Note dismissal={{ label: t('hints.dismiss'), onDismiss: hint.dismiss }}>{children}</Note>
    </Collapse>
  )
}
