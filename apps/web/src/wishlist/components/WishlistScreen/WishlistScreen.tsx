import { IconGift, IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { Heading } from '@/ui/components/Heading'
import { Note } from '@/ui/components/Note'
import { wishlistQuery } from '@/wishlist/api/wishlist'
import { WishlistItem } from '../WishlistItem'
import classes from './WishlistScreen.module.css'

export const WishlistScreen = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: items } = useSuspenseQuery(wishlistQuery)

  const addItem = () => void navigate({ to: '/wishlist/new' })

  const plus = <IconPlus stroke={2} aria-hidden />

  return (
    <>
      <ScreenHeader
        title={t('wishlist.list.title')}
        action={
          <Button size="sm" icon={plus} onClick={addItem}>
            {t('wishlist.list.add')}
          </Button>
        }
      />
      <Note>{t('wishlist.list.note')}</Note>
      {items.length === 0 ? (
        <Card quiet className={classes.empty}>
          <span className={classes.emptyIcon}>
            <IconGift stroke={1.8} aria-hidden />
          </span>
          <Heading order={2} size="sm">
            {t('wishlist.list.empty.title')}
          </Heading>
          <p className={classes.emptyBody}>{t('wishlist.list.empty.body')}</p>
          <Button icon={plus} onClick={addItem}>
            {t('wishlist.list.empty.add')}
          </Button>
        </Card>
      ) : (
        <ul className={classes.list}>
          {items.map((item) => (
            <li key={item.id}>
              <WishlistItem item={item} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
