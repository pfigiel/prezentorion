import type { QueryKey } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { RecipientItem as Item, Person } from '@/draws/api/draws'
import { Note } from '@/ui/components/Note'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { isOnOffer } from '@/wishlist/utils/is-on-offer'
import { RecipientItem } from '../RecipientItem'
import classes from './RecipientWishlist.module.css'

type Props = {
  recipient: Person
  items: Item[]
  /** Where the items came from, refetched once a purchase is saved. */
  listKey: QueryKey
  savePurchased: (itemId: string, purchased: boolean) => Promise<void>
}

export const RecipientWishlist = ({ recipient, items, listKey, savePurchased }: Props) => {
  const { t } = useTranslation()
  const availableCount = items.filter(isOnOffer).length

  const content = () => {
    if (recipient.name === null) return <Note>{t('draws.recipient.pending')}</Note>
    if (items.length === 0) return <p className={classes.empty}>{t('draws.recipient.emptyList')}</p>

    return items.map((item) => (
      <RecipientItem
        key={item.id}
        item={item}
        listKey={listKey}
        savePurchased={(purchased) => savePurchased(item.id, purchased)}
      />
    ))
  }

  return (
    <>
      <SectionLabel>{t('draws.recipient.list', { count: availableCount })}</SectionLabel>
      {content()}
    </>
  )
}
