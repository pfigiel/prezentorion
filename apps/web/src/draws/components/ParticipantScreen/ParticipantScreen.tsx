import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { drawQuery, participantWishlistQuery, setOpenPurchase } from '@/draws/api/draws'
import { moneyLabelOf } from '@/formatting/labels'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Note } from '@/ui/components/Note'
import { DrawNotFound } from '../DrawNotFound'
import { RecipientWishlist } from '../RecipientWishlist'

type Props = {
  drawId: string
  participantId: string
}

/** A fellow participant's wish list in an open draw, where anyone may buy for them. */
export const ParticipantScreen = ({ drawId, participantId }: Props) => {
  const { t } = useTranslation()
  const { data: draw } = useSuspenseQuery(drawQuery(drawId))
  const wishlist = participantWishlistQuery(drawId, participantId)
  const { data: items } = useSuspenseQuery(wishlist)
  const participant = draw.participants.find(({ id }) => id === participantId)

  if (draw.mode !== 'open' || draw.status === 'waiting' || !participant || participant.isMe) {
    return <DrawNotFound />
  }

  return (
    <>
      <ScreenHeader
        title={participant.name ?? participant.email}
        back={{ to: '/draws/$drawId', params: { drawId } }}
      />
      {draw.budget === null ? null : (
        <Note>{t('draws.open.budget', { budget: moneyLabelOf(draw.budget) })}</Note>
      )}
      <RecipientWishlist
        recipient={participant}
        items={items}
        listKey={wishlist.queryKey}
        savePurchased={(itemId, purchased) =>
          setOpenPurchase(drawId, participantId, itemId, purchased)
        }
      />
    </>
  )
}
