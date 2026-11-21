import { useSuspenseQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { drawQuery } from '@/draws/api/draws'
import { prefersReducedMotion } from '@/draws/utils/prefers-reduced-motion'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { RevealedDraw } from '../RevealedDraw'
import { RevealTile } from '../RevealTile'
import { StatusBadge } from '../StatusBadge'
import { WaitingDraw } from '../WaitingDraw'

type Props = {
  drawId: string
}

/** Where a reveal made on this screen has got to; a draw revealed earlier skips straight to done. */
type RevealStage = 'done' | 'showing' | 'settling'

/** How long the tile shows who it is before shrinking into the card. */
const showingMs = 1800

export const DrawScreen = ({ drawId }: Props) => {
  const { data: draw } = useSuspenseQuery(drawQuery(drawId))
  const [stage, setStage] = useState<RevealStage>('done')
  const isShowing = stage === 'showing' && draw.recipient !== null

  useEffect(() => {
    if (!isShowing) return

    const timer = window.setTimeout(() => setStage('settling'), showingMs)

    return () => window.clearTimeout(timer)
  }, [isShowing])

  const startReveal = () => {
    if (!prefersReducedMotion()) setStage('showing')
  }

  const content = () => {
    if (draw.status === 'waiting') return <WaitingDraw draw={draw} />

    if (draw.recipient === null || stage === 'showing') {
      return <RevealTile draw={draw} recipient={draw.recipient} onRevealed={startReveal} />
    }

    return (
      <RevealedDraw draw={draw} recipient={draw.recipient} justRevealed={stage === 'settling'} />
    )
  }

  return (
    <>
      <ScreenHeader
        title={draw.name}
        back={{ to: '/' }}
        action={
          draw.status === 'finished' && draw.recipient !== null ? (
            <StatusBadge status={draw.status} />
          ) : undefined
        }
      />
      {content()}
    </>
  )
}
