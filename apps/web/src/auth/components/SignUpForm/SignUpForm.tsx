import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { signUp } from '@/auth/api/session'
import { errorKeyOf } from '@/auth/utils/error-key-of'
import { Button } from '@/ui/components/Button'
import { TextInput } from '@/ui/components/TextInput'
import classes from './SignUpForm.module.css'

export const SignUpForm = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const register = useMutation({
    mutationFn: () => signUp(name.trim(), email, password),
    onSuccess: () => navigate({ to: '/' }),
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    register.mutate()
  }

  return (
    <form className={classes.root} onSubmit={submit}>
      <TextInput
        label={t('auth.login.name')}
        placeholder={t('auth.login.namePlaceholder')}
        autoComplete="given-name"
        required
        value={name}
        onChange={setName}
      />
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
        autoComplete="new-password"
        required
        value={password}
        error={register.isError ? t(errorKeyOf(register.error)) : undefined}
        onChange={setPassword}
      />
      <Button type="submit" loading={register.isPending}>
        {t('auth.login.signUp')}
      </Button>
    </form>
  )
}
