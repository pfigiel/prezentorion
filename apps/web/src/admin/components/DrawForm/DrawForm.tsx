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
import { minimumParticipants } from '@/admin/constants/draws'
import { canDraw } from '@/admin/utils/can-draw'
import { pairKeyOf } from '@/admin/utils/pair-key-of'
import { completePairsOf, pairRowOf } from '@/admin/utils/pair-row-of'
import { Button } from '@/ui/components/Button'
import { Modal } from '@/ui/components/Modal'
import { Stepper } from '@/ui/components/Stepper'
import { TextInput } from '@/ui/components/TextInput'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import { ExcludedPairsEditor } from '../ExcludedPairsEditor'
import { ParticipantsEditor } from '../ParticipantsEditor'
import classes from './DrawForm.module.css'

type Props = {
  /** The draw being edited; a new one starts with nobody taking part. */
  draw?: AdminDraw
}

const wholeAmount = /^\d+$/

const steps = ['details', 'participants', 'excludedPairs'] as const
const lastStep = steps.length - 1

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value) => b.includes(value))

export const DrawForm = ({ draw }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: account } = useSuspenseQuery(accountQuery)
  const { data: users } = useSuspenseQuery(usersQuery)
  const initialEmails = draw?.participants.map(({ email }) => email) ?? []
  const initialPairs = draw?.excludedPairs ?? []
  const [step, setStep] = useState(0)
  const [reached, setReached] = useState(draw === undefined ? 0 : lastStep)
  const [name, setName] = useState(draw?.name ?? '')
  const [eventDate, setEventDate] = useState(draw?.eventDate ?? '')
  const [budget, setBudget] = useState(draw?.budget?.toString() ?? '')
  const [emails, setEmails] = useState(initialEmails)
  const [pairRows, setPairRows] = useState(() =>
    initialPairs.length === 0 ? [pairRowOf()] : initialPairs.map((pair) => pairRowOf(pair)),
  )
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
    onError: redraw.close,
  })

  const excludedPairs = completePairsOf(pairRows)
  const isDrawn = draw !== undefined && draw.status !== 'waiting'
  const trimmedBudget = budget.trim()
  const errors = [
    {
      name: name.trim() === '' ? t('admin.form.required') : undefined,
      eventDate: eventDate === '' ? t('admin.form.required') : undefined,
      budget:
        trimmedBudget === '' || wholeAmount.test(trimmedBudget)
          ? undefined
          : t('admin.form.invalidBudget'),
    },
    {
      participants:
        isDrawn && emails.length < minimumParticipants ? t('admin.form.tooFewToRedraw') : undefined,
    },
    {
      incompletePair: pairRows.some(({ first, second }) => (first === null) !== (second === null))
        ? t('admin.form.incompletePair')
        : undefined,
      excludedPairs:
        emails.length >= minimumParticipants && !canDraw(emails, excludedPairs)
          ? t('admin.form.impossibleDraw')
          : undefined,
    },
  ] as const
  const [detailsErrors, participantsErrors, excludedPairsErrors] = errors
  const fields: DrawFields = {
    name: name.trim(),
    eventDate,
    budget: trimmedBudget === '' ? null : Number(trimmedBudget),
    emails,
    excludedPairs,
  }
  const needsRedraw =
    isDrawn &&
    (!sameSet(emails, initialEmails) ||
      !sameSet(excludedPairs.map(pairKeyOf), initialPairs.map(pairKeyOf)))

  const stopsBefore = (target: number) => {
    const invalid = errors
      .slice(0, target)
      .findIndex((stepErrors) => Object.values(stepErrors).some((error) => error !== undefined))

    if (invalid === -1) return false

    setStep(invalid)
    setShowErrors(true)

    return true
  }

  const goTo = (target: number) => {
    if (target > step && stopsBefore(target)) return

    setStep(target)
    setReached(Math.max(reached, target))
    setShowErrors(false)
  }

  const changeEmails = (next: string[]) => {
    setEmails(next)
    setPairRows(
      pairRows.filter(({ first, second }) =>
        [first, second].every((email) => email === null || next.includes(email)),
      ),
    )
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()

    if (step < lastStep) {
      goTo(step + 1)

      return
    }

    if (stopsBefore(steps.length)) return

    if (needsRedraw) {
      redraw.open()
    } else {
      save.mutate(fields)
    }
  }

  return (
    <form className={classes.root} onSubmit={submit}>
      <Stepper
        steps={steps.map((stage) => t(`admin.form.steps.${stage}`))}
        active={step}
        reached={reached}
        onSelect={goTo}
      />
      {steps[step] === 'details' ? (
        <>
          <TextInput
            label={t('admin.form.name')}
            placeholder={t('admin.form.namePlaceholder')}
            required
            value={name}
            error={showErrors ? detailsErrors.name : undefined}
            onChange={setName}
          />
          <div className={classes.pair}>
            <TextInput
              label={t('admin.form.eventDate')}
              type="date"
              required
              value={eventDate}
              error={showErrors ? detailsErrors.eventDate : undefined}
              onChange={setEventDate}
            />
            <TextInput
              label={t('admin.form.budget')}
              inputMode="numeric"
              value={budget}
              error={showErrors ? detailsErrors.budget : undefined}
              onChange={setBudget}
            />
          </div>
        </>
      ) : null}
      {steps[step] === 'participants' ? (
        <>
          <ParticipantsEditor
            emails={emails}
            users={users}
            ownEmail={account.email}
            onChange={changeEmails}
          />
          {showErrors && participantsErrors.participants !== undefined ? (
            <p className={classes.error}>{participantsErrors.participants}</p>
          ) : null}
        </>
      ) : null}
      {steps[step] === 'excludedPairs' ? (
        <>
          <ExcludedPairsEditor
            rows={pairRows}
            emails={emails}
            users={users}
            incompleteError={showErrors ? excludedPairsErrors.incompletePair : undefined}
            onChange={setPairRows}
          />
          {excludedPairsErrors.excludedPairs === undefined ? null : (
            <p className={classes.error}>{excludedPairsErrors.excludedPairs}</p>
          )}
        </>
      ) : null}
      {save.isError ? <p className={classes.error}>{t('admin.form.saveFailed')}</p> : null}
      <div className={classes.actions}>
        {step === 0 ? null : (
          <Button variant="secondary" onClick={() => goTo(step - 1)}>
            {t('admin.form.back')}
          </Button>
        )}
        <Button type="submit" loading={save.isPending && !redrawOpened}>
          {step === lastStep ? t('admin.form.save') : t('admin.form.next')}
        </Button>
      </div>
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
