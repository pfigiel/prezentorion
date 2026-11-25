import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { RecipientItem as Item } from '@/draws/api/draws'
import { Switch } from '@/ui/components/Switch'
import { ItemCard } from '@/wishlist/components/ItemCard'
import classes from './RecipientItem.module.css'

type Props = {
  item: Item
  /** The list the item is on, refetched once a purchase is saved. */
  listKey: QueryKey
  savePurchased: (purchased: boolean) => Promise<void>
}

export const RecipientItem = ({ item, listKey, savePurchased }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const purchase = useMutation({
    mutationFn: savePurchased,
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
  })

  const isPurchasedByMe = purchase.isPending ? purchase.variables : item.purchasedBy === 'me'
  const isTaken = item.purchasedBy === 'other' && !item.repeatable

  const repeatableNote = () => {
    if (!item.repeatable) return null

    return (
      <p className={classes.purchasedByOther}>
        {item.otherBuyers === 0
          ? t('draws.item.repeatable')
          : t('draws.item.otherBuyers', { count: item.otherBuyers })}
      </p>
    )
  }

  return (
    <ItemCard item={item} taken={isTaken}>
      {isTaken ? (
        <p className={classes.purchasedByOther}>{t('draws.item.purchasedByOther')}</p>
      ) : (
        <>
          {repeatableNote()}
          <Switch
            label={isPurchasedByMe ? t('draws.item.purchasedByMe') : t('draws.item.markPurchased')}
            checked={isPurchasedByMe}
            onChange={(purchased) => purchase.mutate(purchased)}
          />
        </>
      )}
    </ItemCard>
  )
}
