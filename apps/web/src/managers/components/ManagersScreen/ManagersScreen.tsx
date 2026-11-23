import { IconX } from '@tabler/icons-react'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { Hint } from '@/hints/components/Hint'
import { addManager, managersQuery, removeManager } from '@/managers/api/managers'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Avatar } from '@/ui/components/Avatar'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Form } from '@/ui/components/Form'
import { IconButton } from '@/ui/components/IconButton'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { TextInput } from '@/ui/components/TextInput'
import classes from './ManagersScreen.module.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Problem = 'email' | 'own' | 'duplicate'

export const ManagersScreen = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { data: account } = useSuspenseQuery(accountQuery)
  const { data: managers } = useSuspenseQuery(managersQuery)
  const [email, setEmail] = useState('')
  const [problem, setProblem] = useState<Problem | null>(null)

  const refresh = () => queryClient.invalidateQueries(managersQuery)
  const add = useMutation({
    mutationFn: addManager,
    onSuccess: async () => {
      setEmail('')
      await refresh()
    },
  })
  const remove = useMutation({ mutationFn: removeManager, onSettled: refresh })

  const problemOf = (address: string): Problem | null => {
    if (!emailPattern.test(address)) return 'email'
    if (address === account.email.toLowerCase()) return 'own'
    if (managers.some((manager) => manager.email === address)) return 'duplicate'

    return null
  }

  const submit = () => {
    const address = email.trim().toLowerCase()
    const found = problemOf(address)
    setProblem(found)

    if (found === null) add.mutate(address)
  }

  const changeEmail = (value: string) => {
    setEmail(value)
    setProblem(null)
    add.reset()
  }

  const error = () => {
    if (problem !== null) return t(`managers.settings.errors.${problem}`)
    if (add.isError) return t('managers.settings.errors.save')

    return undefined
  }

  return (
    <>
      <ScreenHeader title={t('managers.settings.title')} back={{ to: '/wishlist' }} />
      <Hint name="managers">{t('managers.settings.note')}</Hint>
      <Form noValidate className={classes.form} onSubmit={submit}>
        <TextInput
          label={t('managers.settings.email')}
          type="email"
          autoComplete="off"
          placeholder={t('managers.settings.emailPlaceholder')}
          value={email}
          error={error()}
          onChange={changeEmail}
        />
        <p className={classes.hint}>{t('managers.settings.hint')}</p>
        <Button type="submit" size="md" loading={add.isPending}>
          {t('managers.settings.add')}
        </Button>
      </Form>
      <SectionLabel>{t('managers.settings.list', { count: managers.length })}</SectionLabel>
      {managers.length === 0 ? (
        <p className={classes.empty}>{t('managers.settings.empty')}</p>
      ) : (
        <Card quiet className={classes.list}>
          <ul className={classes.rows}>
            {managers.map((manager) => (
              <li key={manager.id} className={classes.row}>
                <Avatar name={manager.email} pictureUrl={null} />
                <span className={classes.email}>{manager.email}</span>
                <IconButton
                  label={t('managers.settings.remove', { email: manager.email })}
                  onClick={() => remove.mutate(manager.id)}
                >
                  <IconX stroke={1.8} aria-hidden />
                </IconButton>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
