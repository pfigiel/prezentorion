import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { signInWithPassword } from '@/auth/api/session'
import { errorKeyOf } from '@/auth/utils/error-key-of'
import { Button } from '@/ui/components/Button'
import { Form } from '@/ui/components/Form'
import { TextInput } from '@/ui/components/TextInput'
import classes from './SignInForm.module.css'

export const SignInForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const signIn = useMutation({
    mutationFn: () => signInWithPassword(email, password),
    onSuccess: () => navigate({ to: '/' }),
    meta: { showsOwnError: true },
  })

  const submit = () => {
    signIn.mutate()
  }

  return (
    <Form className={classes.root} onSubmit={submit}>
      <TextInput
        label={t('auth.login.email')}
        type="email"
        placeholder={t('auth.login.emailPlaceholder')}
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
      />
      <TextInput
        label={t('auth.login.password')}
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        value={password}
        error={signIn.isError ? t(errorKeyOf(signIn.error)) : undefined}
        onChange={setPassword}
      />
      <Button type="submit" loading={signIn.isPending}>
        {t('auth.login.signIn')}
      </Button>
    </Form>
  )
}
