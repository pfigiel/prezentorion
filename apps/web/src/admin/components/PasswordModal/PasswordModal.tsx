import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { setUserPassword, type User } from '@/admin/api/admin'
import { displayNameOf } from '@/admin/utils/display-name-of'
import { Button } from '@/ui/components/Button'
import { Form } from '@/ui/components/Form'
import { Modal } from '@/ui/components/Modal'
import { TextInput } from '@/ui/components/TextInput'
import classes from './PasswordModal.module.css'

type Props = {
  opened: boolean
  /** Whoever was last chosen; kept while the modal closes so its text does not vanish mid-fade. */
  user: User | null
  onClose: () => void
}

const minimumLength = 8

export const PasswordModal = ({ opened, user, onClose }: Props) => {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [showError, setShowError] = useState(false)
  const change = useMutation({
    mutationFn: ({ userId, value }: { userId: string; value: string }) =>
      setUserPassword(userId, value),
  })

  const close = () => {
    setPassword('')
    setShowError(false)
    change.reset()
    onClose()
  }

  const save = () => {
    setShowError(true)

    if (user?.id && password.length >= minimumLength) {
      change.mutate({ userId: user.id, value: password })
    }
  }

  const tooShort = showError && password.length < minimumLength

  return (
    <Modal
      opened={opened}
      title={t('admin.users.passwordTitle', { name: user === null ? '' : displayNameOf(user) })}
      onClose={close}
    >
      {change.isSuccess ? (
        <>
          {t('admin.users.passwordSaved')}
          <Button size="md" onClick={close}>
            {t('admin.users.done')}
          </Button>
        </>
      ) : (
        <Form className={classes.form} onSubmit={save}>
          {t('admin.users.passwordHint')}
          <TextInput
            label={t('admin.users.passwordLabel')}
            autoComplete="off"
            value={password}
            error={tooShort ? t('admin.users.tooShort') : undefined}
            onChange={setPassword}
          />
          <Modal.Actions>
            <Button variant="secondary" size="md" onClick={close}>
              {t('admin.users.cancel')}
            </Button>
            <Button type="submit" size="md" loading={change.isPending}>
              {t('admin.users.save')}
            </Button>
          </Modal.Actions>
        </Form>
      )}
    </Modal>
  )
}
