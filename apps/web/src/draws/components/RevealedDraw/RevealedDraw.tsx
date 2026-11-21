import clsx from 'clsx'
import type { Draw, Person } from '@/draws/api/draws'
import { RecipientCard } from '../RecipientCard'
import { RecipientWishlist } from '../RecipientWishlist'
import classes from './RevealedDraw.module.css'

type Props = {
  draw: Draw
  recipient: Person
  /** Plays the end of the reveal: the card settles and the list slides in beneath it. */
  justRevealed: boolean
}

export const RevealedDraw = ({ draw, recipient, justRevealed }: Props) => (
  <>
    <RecipientCard draw={draw} recipient={recipient} justRevealed={justRevealed} />
    <div className={clsx(classes.list, justRevealed && classes.slideIn)}>
      <RecipientWishlist drawId={draw.id} recipient={recipient} />
    </div>
  </>
)
