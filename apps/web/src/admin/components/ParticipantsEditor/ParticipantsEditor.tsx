import { IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { User } from '@/admin/api/admin'
import { displayNameOf } from '@/admin/utils/display-name-of'
import { participantOf } from '@/admin/utils/participant-of'
import { Avatar } from '@/ui/components/Avatar'
import { Badge } from '@/ui/components/Badge'
import { Card } from '@/ui/components/Card'
import { IconButton } from '@/ui/components/IconButton'
import { SearchSelect } from '@/ui/components/SearchSelect'
import { SectionLabel } from '@/ui/components/SectionLabel'
import classes from './ParticipantsEditor.module.css'

type Props = {
  emails: string[]
  users: User[]
  /** The signed-in admin's address, marked "(Ty)" in the list. */
  ownEmail: string
  onChange: (emails: string[]) => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ParticipantsEditor = ({ emails, users, ownEmail, onChange }: Props) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const needle = query.trim().toLowerCase()
  const options = users
    .filter(
      (user) =>
        !emails.includes(user.email) &&
        (user.email.includes(needle) || (user.name?.toLowerCase().includes(needle) ?? false)),
    )
    .map((user) => ({
      value: user.email,
      label: displayNameOf(user),
      description: user.name === null ? t('admin.form.pending') : user.email,
    }))
  const isNewAddress =
    emailPattern.test(needle) &&
    !emails.includes(needle) &&
    !users.some((user) => user.email === needle)

  if (isNewAddress) {
    options.push({
      value: needle,
      label: t('admin.form.invite', { email: needle }),
      description: t('admin.form.inviteHint'),
    })
  }

  const add = (email: string) => {
    onChange([...emails, email])
    setQuery('')
  }

  return (
    <>
      <SectionLabel>{t('admin.form.participants', { count: emails.length })}</SectionLabel>
      <SearchSelect
        label={t('admin.form.addParticipant')}
        placeholder={t('admin.form.searchPlaceholder')}
        query={query}
        options={options}
        nothingFound={t('admin.form.nothingFound')}
        onQueryChange={setQuery}
        onPick={add}
      />
      {emails.length === 0 ? null : (
        <Card quiet className={classes.list}>
          <ul className={classes.rows}>
            {emails.map((email) => {
              const participant = participantOf(email, users)
              const name = displayNameOf(participant)

              return (
                <li key={email} className={classes.row}>
                  <Avatar name={participant.name} pictureUrl={participant.pictureUrl} />
                  <span className={classes.who}>
                    <span className={classes.name}>
                      {email === ownEmail ? t('admin.form.you', { name }) : name}
                    </span>
                    {participant.name === null ? (
                      <Badge tone="pending">{t('admin.form.pending')}</Badge>
                    ) : (
                      <span className={classes.email}>{email}</span>
                    )}
                  </span>
                  <IconButton
                    label={t('admin.form.remove', { name })}
                    onClick={() => onChange(emails.filter((other) => other !== email))}
                  >
                    <IconX stroke={1.8} aria-hidden />
                  </IconButton>
                </li>
              )
            })}
          </ul>
        </Card>
      )}
    </>
  )
}
