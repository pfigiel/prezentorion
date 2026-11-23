import { useSuspenseQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { recipientWishlistQuery, setPurchased, type Draw, type Person } from '@/draws/api/draws'
import { RecipientCard } from '../RecipientCard'
import { RecipientWishlist } from '../RecipientWishlist'
import classes from './RevealedDraw.module.css'

type Props = {
  draw: Draw
  recipient: Person
  /** Plays the end of the reveal: the card settles and the list slides in beneath it. */
  justRevealed: boolean
}

export const RevealedDraw = ({ draw, recipient, justRevealed }: Props) => {
  const wishlist = recipientWishlistQuery(draw.id)
  const { data: items } = useSuspenseQuery(wishlist)

  return (
    <>
      <RecipientCard draw={draw} recipient={recipient} justRevealed={justRevealed} />
      <div className={clsx(classes.list, justRevealed && classes.slideIn)}>
        <RecipientWishlist
          recipient={recipient}
          items={items}
          listKey={wishlist.queryKey}
          savePurchased={(itemId, purchased) => setPurchased(draw.id, itemId, purchased)}
        />
      </div>
    </>
  )
}
