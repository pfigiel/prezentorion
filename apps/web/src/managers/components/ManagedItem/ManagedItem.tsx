import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  managedListQuery,
  setManagedPurchase,
  type ManagedItem as Item,
  type ManagedList,
} from '@/managers/api/managers'
import { Switch } from '@/ui/components/Switch'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import { ItemCard } from '@/wishlist/components/ItemCard'
import { PurchaseModal } from '../PurchaseModal'
import classes from './ManagedItem.module.css'

type Props = {
  list: ManagedList
  item: Item
}

export const ManagedItem = ({ list, item }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [purchaseOpened, purchaseDialog] = useDisclosure(false)
  const purchase = useMutation({
    mutationFn: (change: { purchased: boolean; drawId: string | null }) =>
      setManagedPurchase(list.owner.id, item.id, change),
    onSuccess: purchaseDialog.close,
    onSettled: () => queryClient.invalidateQueries(managedListQuery(list.owner.id)),
  })

  const isPurchasedByMe = purchase.isPending
    ? purchase.variables.purchased
    : item.purchasedBy === 'me'

  const toggle = (purchased: boolean) => {
    if (purchased) {
      purchase.reset()
      purchaseDialog.open()
    } else {
      purchase.mutate({ purchased: false, drawId: null })
    }
  }

  return (
    <ItemCard item={item}>
      {item.purchasedBy === 'other' ? (
        <p className={classes.purchasedByOther}>{t('managers.item.purchasedByOther')}</p>
      ) : (
        <Switch
          label={isPurchasedByMe ? t('managers.item.purchasedByMe') : t('managers.item.purchased')}
          checked={isPurchasedByMe}
          onChange={toggle}
        />
      )}
      <PurchaseModal
        opened={purchaseOpened}
        list={list}
        saving={purchase.isPending}
        failed={purchase.isError}
        onClose={purchaseDialog.close}
        onConfirm={(drawId) => purchase.mutate({ purchased: true, drawId })}
      />
    </ItemCard>
  )
}
