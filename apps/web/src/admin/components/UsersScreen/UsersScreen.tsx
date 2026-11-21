import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { usersQuery, type User } from '@/admin/api/admin'
import { displayNameOf } from '@/admin/utils/display-name-of'
import { signInLabelKeyOf } from '@/admin/utils/sign-in-label-key-of'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Avatar } from '@/ui/components/Avatar'
import { Badge } from '@/ui/components/Badge'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { TextInput } from '@/ui/components/TextInput'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import { AdminNav } from '../AdminNav'
import { PasswordModal } from '../PasswordModal'
import classes from './UsersScreen.module.css'

export const UsersScreen = () => {
  const { t } = useTranslation()
  const { data: account } = useSuspenseQuery(accountQuery)
  const { data: users } = useSuspenseQuery(usersQuery)
  const [search, setSearch] = useState('')
  const [chosen, setChosen] = useState<User | null>(null)
  const [passwordOpened, passwordModal] = useDisclosure(false)

  const needle = search.trim().toLowerCase()
  const matching = users.filter(
    (user) => user.email.includes(needle) || (user.name?.toLowerCase().includes(needle) ?? false),
  )

  const choosePasswordFor = (user: User) => {
    setChosen(user)
    passwordModal.open()
  }

  const detailsOf = (user: User) =>
    user.id === null
      ? t('admin.users.pending')
      : [
          user.email,
          t(signInLabelKeyOf(user)),
          t('admin.users.draws', { count: user.drawCount }),
        ].join(' · ')

  return (
    <>
      <ScreenHeader title={t('admin.title')} />
      <AdminNav />
      <TextInput
        label={t('admin.users.searchLabel')}
        placeholder={t('admin.users.searchPlaceholder')}
        value={search}
        onChange={setSearch}
      />
      <span className={classes.count}>{t('admin.users.count', { count: matching.length })}</span>
      <Card quiet className={classes.list}>
        <ul className={classes.rows}>
          {matching.map((user) => (
            <li key={user.id ?? user.email} className={classes.row}>
              <Avatar name={user.name} pictureUrl={user.pictureUrl} />
              <span className={classes.who}>
                <span className={classes.name}>
                  {displayNameOf(user)}
                  {user.id === account.id ? <Badge>{t('admin.users.admin')}</Badge> : null}
                </span>
                <span className={classes.details}>{detailsOf(user)}</span>
              </span>
              {user.id !== null && user.signsInWithPassword ? (
                <Button variant="secondary" size="sm" onClick={() => choosePasswordFor(user)}>
                  {t('admin.users.newPassword')}
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
      <PasswordModal opened={passwordOpened} user={chosen} onClose={passwordModal.close} />
    </>
  )
}
