import { useSuspenseQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/components/Button'
import { Card } from '@/ui/components/Card'
import { wishlistQuery } from '@/wishlist/api/wishlist'
import { ItemForm } from '../ItemForm'
import classes from './EditItemScreen.module.css'

type Props = {
  itemId: string
}

export const EditItemScreen = ({ itemId }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: items } = useSuspenseQuery(wishlistQuery)
  const item = items.find(({ id }) => id === itemId)

  if (item === undefined) {
    return (
      <Card quiet>
        <p className={classes.message}>{t('wishlist.form.notFound')}</p>
        <Button variant="secondary" onClick={() => void navigate({ to: '/wishlist' })}>
          {t('wishlist.form.backToList')}
        </Button>
      </Card>
    )
  }

  return <ItemForm key={item.id} item={item} />
}
