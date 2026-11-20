import type { CSSProperties } from 'react'
import classes from './StarrySky.module.css'

type Star = {
  left: string
  top: string
  size: number
  opacity: number
  /** A brighter star with a halo; the warm one is the gold of the accent. */
  glow?: 'cool' | 'warm'
}

const stars: Star[] = [
  { left: '11%', top: '14%', size: 2, opacity: 0.55 },
  { left: '82%', top: '11%', size: 3, opacity: 0.45 },
  { left: '69%', top: '18%', size: 2, opacity: 0.35 },
  { left: '90%', top: '72%', size: 2, opacity: 0.3 },
  { left: '6%', top: '62%', size: 2, opacity: 0.3 },
  { left: '38%', top: '3%', size: 2, opacity: 0.5 },
  { left: '58%', top: '5%', size: 1, opacity: 0.7 },
  { left: '95%', top: '21%', size: 2, opacity: 0.4 },
  { left: '50%', top: '15%', size: 1, opacity: 0.6 },
  { left: '3%', top: '31%', size: 2, opacity: 0.35 },
  { left: '97%', top: '39%', size: 1, opacity: 0.6 },
  { left: '2%', top: '49%', size: 1, opacity: 0.5 },
  { left: '96%', top: '55%', size: 2, opacity: 0.3 },
  { left: '3%', top: '77%', size: 2, opacity: 0.25 },
  { left: '77%', top: '87%', size: 1, opacity: 0.4 },
  { left: '15%', top: '88%', size: 2, opacity: 0.3 },
  { left: '25%', top: '7%', size: 3, opacity: 0.5, glow: 'warm' },
  { left: '87%', top: '30%', size: 3, opacity: 0.45, glow: 'cool' },
]

/* Deterministic per star, so each twinkles out of step with its neighbours without reshuffling on render. */
const twinkleOf = (index: number) =>
  ({
    '--twinkle-duration': `${3 + ((index * 7) % 5)}s`,
    '--twinkle-delay': `${-((index * 13) % 7)}s`,
  }) as CSSProperties

export const StarrySky = () => (
  <div className={classes.root} aria-hidden="true">
    {stars.map((star, index) => (
      <i
        key={`${star.left}-${star.top}`}
        className={star.glow === undefined ? classes.star : classes[star.glow]}
        style={{
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          opacity: star.opacity,
          ...twinkleOf(index),
        }}
      />
    ))}
  </div>
)
