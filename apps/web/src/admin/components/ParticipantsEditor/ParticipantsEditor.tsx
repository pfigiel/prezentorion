import { IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { User } from '@/admin/api/admin'
import { displayNameOf } from '@/admin/utils/display-name-of'
import { participantOf } from '@/admin/utils/participant-of'
import { Avatar } from '@/ui/components/Avatar'
import { Badge } from '@/ui/components/Badge'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { IconButton } from '@/ui/components/IconButton'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { SuggestInput } from '@/ui/components/SuggestInput'
import classes from './ParticipantsEditor.module.css'

type Props = {
  emails: string[]
  users: User[]
  /** The signed-in admin's address, marked "(Ty)" in the list. */
  ownEmail: string
  onChange: (emails: string[]) => void
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const suggestionLimit = 5

export const ParticipantsEditor = ({ emails, users, ownEmail, onChange }: Props) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string>()

  const needle = query.trim().toLowerCase()
  const suggestions = users
    .filter(
      (user) =>
        !emails.includes(user.email) &&
        needle !== '' &&
        (user.email.includes(needle) || (user.name?.toLowerCase().includes(needle) ?? false)),
    )
    .slice(0, suggestionLimit)
    .map((user) => ({
      value: user.email,
      label: displayNameOf(user),
      description: user.name === null ? undefined : user.email,
    }))

  const add = (text: string) => {
    const email = text.trim().toLowerCase()

    if (!emailPattern.test(email)) {
      setError(t('admin.form.invalidEmail'))
    } else if (emails.includes(email)) {
      setError(t('admin.form.alreadyAdded'))
    } else {
      onChange([...emails, email])
      setQuery('')
      setError(undefined)
    }
  }

  const type = (text: string) => {
    setQuery(text)
    setError(undefined)
  }

  return (
    <>
      <SectionLabel>{t('admin.form.participants', { count: emails.length })}</SectionLabel>
      <div className={classes.add}>
        <SuggestInput
          label={t('admin.form.addParticipant')}
          placeholder={t('admin.form.searchPlaceholder')}
          value={query}
          suggestions={suggestions}
          error={error}
          className={classes.search}
          onChange={type}
          onSubmit={add}
        />
        <Button size="md" className={classes.addButton} onClick={() => add(query)}>
          {t('admin.form.add')}
        </Button>
      </div>
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
