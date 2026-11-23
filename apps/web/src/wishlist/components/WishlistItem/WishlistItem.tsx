import { useTranslation } from 'react-i18next'
import { Badge } from '@/ui/components/Badge'
import type { Item } from '@/wishlist/api/wishlist'
import { ItemCard } from '../ItemCard'

type Props = {
  item: Item
}

export const WishlistItem = ({ item }: Props) => {
  const { t } = useTranslation()

  return (
    <ItemCard item={item} editable>
      {item.isPurchased ? <Badge>{t('wishlist.list.purchased')}</Badge> : null}
    </ItemCard>
  )
}
