import { IconArrowsLeftRight, IconPlus, IconTrash } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import type { User } from '@/admin/api/admin'
import { displayNameOf } from '@/admin/utils/display-name-of'
import { pairKeyOf } from '@/admin/utils/pair-key-of'
import { completePairsOf, pairRowOf, type PairRow } from '@/admin/utils/pair-row-of'
import { participantOf } from '@/admin/utils/participant-of'
import { Button } from '@/ui/components/Button'
import { IconButton } from '@/ui/components/IconButton'
import { Note } from '@/ui/components/Note'
import { Select } from '@/ui/components/Select'
import classes from './ExcludedPairsEditor.module.css'

type Side = 'first' | 'second'

type Props = {
  rows: PairRow[]
  emails: string[]
  users: User[]
  /** Shown on the empty side of a pair with only one person picked. */
  incompleteError?: string
  onChange: (rows: PairRow[]) => void
}

const otherSideOf = (side: Side): Side => (side === 'first' ? 'second' : 'first')

export const ExcludedPairsEditor = ({ rows, emails, users, incompleteError, onChange }: Props) => {
  const { t } = useTranslation()

  // Someone already paired elsewhere with the person on the other side would only repeat that pair.
  const optionsOf = (row: PairRow, side: Side) => {
    const other = row[otherSideOf(side)]
    const taken = new Set(
      completePairsOf(rows.filter((candidate) => candidate.id !== row.id)).map(pairKeyOf),
    )

    return emails
      .filter(
        (email) => email !== other && (other === null || !taken.has(pairKeyOf([email, other]))),
      )
      .map((email) => ({ value: email, label: displayNameOf(participantOf(email, users)) }))
  }

  const pick = (row: PairRow, side: Side, email: string) =>
    onChange(rows.map((other) => (other.id === row.id ? { ...row, [side]: email } : other)))

  const add = () => onChange([...rows, pairRowOf()])

  const selectOf = (row: PairRow, side: Side, number: number) => (
    <Select
      label={t('admin.form.pairPerson', { number, side: t(`admin.form.sides.${side}`) })}
      value={row[side]}
      options={optionsOf(row, side)}
      placeholder={t('admin.form.pickPerson')}
      nothingFound={t('admin.form.nobodyToPick')}
      error={row[side] === null && row[otherSideOf(side)] !== null ? incompleteError : undefined}
      onChange={(email) => pick(row, side, email)}
    />
  )

  return (
    <>
      <Note>{t('admin.form.excludedPairsHint')}</Note>
      {rows.length === 0 ? null : (
        <div className={classes.rows}>
          {rows.map((row, index) => {
            const number = index + 1
            const remove = () => onChange(rows.filter((other) => other.id !== row.id))

            return (
              <div
                key={row.id}
                role="group"
                aria-label={t('admin.form.pairNumber', { number })}
                className={classes.row}
              >
                {selectOf(row, 'first', number)}
                <span className={classes.slot}>
                  <IconArrowsLeftRight stroke={1.8} aria-hidden className={classes.icon} />
                </span>
                {selectOf(row, 'second', number)}
                <span className={classes.slot}>
                  <IconButton label={t('admin.form.removePair', { number })} onClick={remove}>
                    <IconTrash stroke={1.8} aria-hidden />
                  </IconButton>
                </span>
              </div>
            )
          })}
        </div>
      )}
      <Button variant="secondary" size="md" icon={<IconPlus stroke={1.8} />} onClick={add}>
        {t('admin.form.addPair')}
      </Button>
    </>
  )
}
