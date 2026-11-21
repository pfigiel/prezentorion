import { IconBrandGoogleFilled } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { signInWithGoogle } from '@/auth/api/session'
import { Button } from '@/ui/components/Button'
import { Logo } from '@/ui/components/Logo'
import { PageColumn } from '@/ui/components/PageColumn'
import { OrDivider } from '../OrDivider'
import { SignInForm } from '../SignInForm'
import { SignUpForm } from '../SignUpForm'
import classes from './LoginScreen.module.css'

type Mode = 'signIn' | 'signUp'

export const LoginScreen = () => {
  const { t } = useTranslation()
  const [mode, setMode] = useState<Mode>('signIn')
  const isSigningIn = mode === 'signIn'

  return (
    <PageColumn>
      <main className={classes.root}>
        <header className={classes.brand}>
          <Logo size="lg" />
          <p className={classes.tagline}>{t('auth.login.tagline')}</p>
        </header>
        <Button
          variant="light"
          icon={<IconBrandGoogleFilled />}
          onClick={() => void signInWithGoogle()}
        >
          {t('auth.login.google')}
        </Button>
        <OrDivider />
        {isSigningIn ? <SignInForm /> : <SignUpForm />}
        <p className={classes.switch}>
          {isSigningIn ? t('auth.login.noAccount') : t('auth.login.haveAccount')}{' '}
          <button
            type="button"
            className={classes.link}
            onClick={() => setMode(isSigningIn ? 'signUp' : 'signIn')}
          >
            {isSigningIn ? t('auth.login.signUp') : t('auth.login.signIn')}
          </button>
        </p>
        <Link to="/privacy-policy" className={classes.privacy}>
          {t('auth.login.privacyPolicy')}
        </Link>
      </main>
    </PageColumn>
  )
}
