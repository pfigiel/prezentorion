import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  drawQuery,
  drawsQuery,
  recipientWishlistQuery,
  revealRecipient,
  type Draw,
  type Person,
} from '@/draws/api/draws'
import { Avatar } from '@/ui/components/Avatar'
import { DrawMeta } from '../DrawMeta'
import { StatusBadge } from '../StatusBadge'
import classes from './RevealTile.module.css'

type Props = {
  draw: Draw
  /** Set once the reveal has happened, for the moment the tile shows who it is before settling. */
  recipient: Person | null
  /** Called before the draw is refetched, so the screen knows to play the reveal when it arrives. */
  onRevealed: () => void
}

export const RevealTile = ({ draw, recipient, onRevealed }: Props) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const reveal = useMutation({
    mutationFn: async () => {
      await revealRecipient(draw.id)
      await queryClient.prefetchQuery(recipientWishlistQuery(draw.id))
    },
    onSuccess: async () => {
      onRevealed()
      await Promise.all([
        queryClient.invalidateQueries(drawQuery(draw.id)),
        queryClient.invalidateQueries(drawsQuery),
      ])
    },
  })

  return (
    <>
      <div className={classes.meta}>
        <DrawMeta
          eventDate={draw.eventDate}
          budget={draw.budget}
          participantCount={draw.participants.length}
        />
        <StatusBadge mode={draw.mode} status={draw.status} />
      </div>
      {recipient === null ? (
        <button
          type="button"
          className={classes.tile}
          disabled={reveal.isPending}
          aria-busy={reveal.isPending}
          onClick={() => reveal.mutate()}
        >
          <span className={classes.mark} aria-hidden="true">
            ?
          </span>
          <span className={classes.tap}>{t('draws.reveal.tap')}</span>
          <span className={classes.privacy}>{t('draws.reveal.privacy')}</span>
        </button>
      ) : (
        <div className={classes.tile} aria-live="polite">
          <span className={classes.burst} aria-hidden="true" />
          <Avatar
            name={recipient.name}
            pictureUrl={recipient.pictureUrl}
            size="lg"
            className={classes.avatar}
          />
          <span className={classes.name}>{recipient.name ?? recipient.email}</span>
        </div>
      )}
    </>
  )
}
