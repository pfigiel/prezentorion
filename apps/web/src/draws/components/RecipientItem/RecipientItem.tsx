import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { recipientWishlistQuery, setPurchased, type RecipientItem as Item } from '@/draws/api/draws'
import { Switch } from '@/ui/components/Switch'
import { ItemCard } from '@/wishlist/components/ItemCard'
import classes from './RecipientItem.module.css'

type Props = {
  drawId: string
  item: Item
}

export const RecipientItem = ({ drawId, item }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const purchase = useMutation({
    mutationFn: (purchased: boolean) => setPurchased(drawId, item.id, purchased),
    onSettled: () => queryClient.invalidateQueries(recipientWishlistQuery(drawId)),
  })

  const isPurchasedByMe = purchase.isPending ? purchase.variables : item.purchasedBy === 'me'

  return (
    <ItemCard item={item}>
      {item.purchasedBy === 'other' ? (
        <p className={classes.purchasedByOther}>{t('draws.item.purchasedByOther')}</p>
      ) : (
        <Switch
          label={isPurchasedByMe ? t('draws.item.purchasedByMe') : t('draws.item.purchased')}
          checked={isPurchasedByMe}
          onChange={(purchased) => purchase.mutate(purchased)}
        />
      )}
    </ItemCard>
  )
}
