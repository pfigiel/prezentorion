import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { recipientWishlistQuery, setPurchased, type RecipientItem as Item } from '@/draws/api/draws'
import { priorityLevelOf } from '@/draws/utils/priority-level-of'
import { moneyLabelOf } from '@/formatting/labels'
import { PriorityDots } from '@/ui/components/PriorityDots'
import { Switch } from '@/ui/components/Switch'
import { ItemThumb } from '@/wishlist/components/ItemThumb'
import classes from './RecipientItem.module.css'

type Props = {
  drawId: string
  item: Item
}

/** One part of the line under the item's name, keyed by what it is since any may be missing. */
type Detail = {
  key: 'price' | 'url' | 'note'
  content: ReactNode
}

export const RecipientItem = ({ drawId, item }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const purchase = useMutation({
    mutationFn: (purchased: boolean) => setPurchased(drawId, item.id, purchased),
    onSettled: () => queryClient.invalidateQueries(recipientWishlistQuery(drawId)),
  })

  const isPurchasedByMe = purchase.isPending ? purchase.variables : item.purchasedBy === 'me'

  const allDetails: Detail[] = [
    {
      key: 'price',
      content:
        item.price === null ? null : t('draws.item.price', { price: moneyLabelOf(item.price) }),
    },
    {
      key: 'url',
      content:
        item.url === null ? null : (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className={classes.link}>
            {t('draws.item.openLink')}
          </a>
        ),
    },
    { key: 'note', content: item.note },
  ]
  const details = allDetails.filter((detail) => detail.content !== null)

  return (
    <article data-surface className={classes.root}>
      <ItemThumb photoPath={item.photoPath} />
      <div className={classes.body}>
        <div className={classes.heading}>
          <h3 className={classes.name}>{item.name}</h3>
          <PriorityDots
            label={t(`draws.item.priority.${priorityLevelOf(item.priority)}`)}
            value={item.priority}
          />
        </div>
        {details.length === 0 ? null : (
          <p className={classes.details}>
            {details.map((detail, index) => (
              <Fragment key={detail.key}>
                {index === 0 ? null : ' · '}
                {detail.content}
              </Fragment>
            ))}
          </p>
        )}
        {item.purchasedBy === 'other' ? (
          <p className={classes.details}>{t('draws.item.purchasedByOther')}</p>
        ) : (
          <Switch
            label={isPurchasedByMe ? t('draws.item.purchasedByMe') : t('draws.item.purchased')}
            checked={isPurchasedByMe}
            onChange={(purchased) => purchase.mutate(purchased)}
          />
        )}
      </div>
    </article>
  )
}
