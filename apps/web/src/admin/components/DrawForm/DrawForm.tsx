import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import {
  createDraw,
  updateDraw,
  usersQuery,
  type AdminDraw,
  type DrawFields,
} from '@/admin/api/admin'
import { Button } from '@/ui/components/Button'
import { Modal } from '@/ui/components/Modal'
import { TextInput } from '@/ui/components/TextInput'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import { ParticipantsEditor } from '../ParticipantsEditor'
import classes from './DrawForm.module.css'

type Props = {
  /** The draw being edited; a new one starts with nobody taking part. */
  draw?: AdminDraw
}

const wholeAmount = /^\d+$/

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value))

export const DrawForm = ({ draw }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: account } = useSuspenseQuery(accountQuery)
  const { data: users } = useSuspenseQuery(usersQuery)
  const initialEmails = draw?.participants.map(({ email }) => email) ?? []
  const [name, setName] = useState(draw?.name ?? '')
  const [eventDate, setEventDate] = useState(draw?.eventDate ?? '')
  const [budget, setBudget] = useState(draw?.budget?.toString() ?? '')
  const [emails, setEmails] = useState(initialEmails)
  const [showErrors, setShowErrors] = useState(false)
  const [redrawOpened, redraw] = useDisclosure(false)

  const save = useMutation({
    mutationFn: async (fields: DrawFields) => {
      if (draw === undefined) return (await createDraw(fields)).id

      await updateDraw(draw.id, fields)

      return draw.id
    },
    onSuccess: async (drawId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin'] }),
        queryClient.invalidateQueries({ queryKey: ['draws'] }),
      ])
      await navigate({ to: '/admin/draws/$drawId', params: { drawId } })
    },
  })

  const trimmedBudget = budget.trim()
  const errors = {
    name: name.trim() === '' ? t('admin.form.required') : undefined,
    eventDate: eventDate === '' ? t('admin.form.required') : undefined,
    budget:
      trimmedBudget === '' || wholeAmount.test(trimmedBudget)
        ? undefined
        : t('admin.form.invalidBudget'),
  }
  const isValid = Object.values(errors).every((error) => error === undefined)
  const fields: DrawFields = {
    name: name.trim(),
    eventDate,
    budget: trimmedBudget === '' ? null : Number(trimmedBudget),
    emails,
  }
  const needsRedraw =
    draw !== undefined && draw.status !== 'waiting' && !sameSet(emails, initialEmails)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setShowErrors(true)

    if (!isValid) return

    if (needsRedraw) {
      redraw.open()
    } else {
      save.mutate(fields)
    }
  }

  return (
    <form className={classes.root} onSubmit={submit}>
      <TextInput
        label={t('admin.form.name')}
        placeholder={t('admin.form.namePlaceholder')}
        required
        value={name}
        error={showErrors ? errors.name : undefined}
        onChange={setName}
      />
      <div className={classes.pair}>
        <TextInput
          label={t('admin.form.eventDate')}
          type="date"
          required
          value={eventDate}
          error={showErrors ? errors.eventDate : undefined}
          onChange={setEventDate}
        />
        <TextInput
          label={t('admin.form.budget')}
          inputMode="numeric"
          value={budget}
          error={showErrors ? errors.budget : undefined}
          onChange={setBudget}
        />
      </div>
      <ParticipantsEditor
        emails={emails}
        users={users}
        ownEmail={account.email}
        onChange={setEmails}
      />
      {save.isError ? <p className={classes.error}>{t('admin.form.saveFailed')}</p> : null}
      <Button type="submit" loading={save.isPending && !redrawOpened} className={classes.submit}>
        {t('admin.form.save')}
      </Button>
      <Modal opened={redrawOpened} title={t('admin.form.redrawTitle')} onClose={redraw.close}>
        {t('admin.form.redrawWarning')}
        <Modal.Actions>
          <Button variant="secondary" size="md" onClick={redraw.close}>
            {t('admin.form.cancel')}
          </Button>
          <Button size="md" loading={save.isPending} onClick={() => save.mutate(fields)}>
            {t('admin.form.saveAndRedraw')}
          </Button>
        </Modal.Actions>
      </Modal>
    </form>
  )
}
