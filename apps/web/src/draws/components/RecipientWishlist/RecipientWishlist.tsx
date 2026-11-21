import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { recipientWishlistQuery, type Person } from '@/draws/api/draws'
import { Note } from '@/ui/components/Note'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { RecipientItem } from '../RecipientItem'
import classes from './RecipientWishlist.module.css'

type Props = {
  drawId: string
  recipient: Person
}

export const RecipientWishlist = ({ drawId, recipient }: Props) => {
  const { t } = useTranslation()
  const { data: items } = useSuspenseQuery(recipientWishlistQuery(drawId))
  const availableCount = items.filter(({ purchasedBy }) => purchasedBy === null).length

  const content = () => {
    if (recipient.name === null) return <Note>{t('draws.recipient.pending')}</Note>
    if (items.length === 0) return <p className={classes.empty}>{t('draws.recipient.emptyList')}</p>

    return items.map((item) => <RecipientItem key={item.id} drawId={drawId} item={item} />)
  }

  return (
    <>
      <SectionLabel>{t('draws.recipient.list', { count: availableCount })}</SectionLabel>
      {content()}
    </>
  )
}
