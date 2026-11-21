import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { Constellation } from '../Constellation'
import classes from './StarrySky.module.css'

type Star = {
  left: string
  top: string
  size: number
  opacity: number
  /** A brighter star with a halo; the warm one is the gold of the accent. */
  glow?: 'cool' | 'warm'
  /** Shown only on a window wide enough to have sky beside the column. */
  wide?: boolean
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
  { left: '7%', top: '8%', size: 2, opacity: 0.24, wide: true },
  { left: '12%', top: '46%', size: 2, opacity: 0.23, wide: true },
  { left: '80%', top: '13%', size: 1, opacity: 0.48, wide: true },
  { left: '7%', top: '24%', size: 1, opacity: 0.45, wide: true },
  { left: '19%', top: '31%', size: 2, opacity: 0.26, wide: true },
  { left: '17%', top: '61%', size: 2, opacity: 0.45, wide: true },
  { left: '91%', top: '20%', size: 2, opacity: 0.24, wide: true },
  { left: '71%', top: '72%', size: 2, opacity: 0.39, wide: true },
  { left: '26%', top: '74%', size: 1, opacity: 0.24, wide: true },
  { left: '70%', top: '45%', size: 1, opacity: 0.63, wide: true },
  { left: '11%', top: '81%', size: 2, opacity: 0.46, wide: true },
  { left: '94%', top: '7%', size: 1, opacity: 0.53, wide: true },
  { left: '97%', top: '88%', size: 2, opacity: 0.33, wide: true },
  { left: '78%', top: '30%', size: 3, opacity: 0.39, glow: 'cool', wide: true },
  { left: '25%', top: '16%', size: 1, opacity: 0.5, wide: true },
  { left: '76%', top: '39%', size: 2, opacity: 0.45, wide: true },
  { left: '93%', top: '72%', size: 3, opacity: 0.22, glow: 'cool', wide: true },
  { left: '90%', top: '43%', size: 1, opacity: 0.29, wide: true },
  { left: '30%', top: '47%', size: 1, opacity: 0.25, wide: true },
  { left: '21%', top: '57%', size: 1, opacity: 0.63, wide: true },
  { left: '87%', top: '3%', size: 1, opacity: 0.59, wide: true },
  { left: '17%', top: '12%', size: 2, opacity: 0.65, wide: true },
  { left: '29%', top: '56%', size: 2, opacity: 0.27, wide: true },
  { left: '28%', top: '86%', size: 1, opacity: 0.57, wide: true },
  { left: '32%', top: '21%', size: 2, opacity: 0.42, wide: true },
  { left: '69%', top: '67%', size: 2, opacity: 0.58, wide: true },
  { left: '68%', top: '97%', size: 3, opacity: 0.35, glow: 'cool', wide: true },
]

/* Deterministic per star, so each twinkles out of step with its neighbours without reshuffling on render. */
const twinkleOf = (index: number) =>
  ({
    '--twinkle-duration': `${3 + ((index * 7) % 5)}s`,
    '--twinkle-delay': `${-((index * 13) % 7)}s`,
  }) as CSSProperties

export const StarrySky = () => (
  <div className={classes.root} aria-hidden="true">
    <div className={classes.glow} />
    {stars.map((star, index) => (
      <i
        key={`${star.left}-${star.top}`}
        className={clsx(
          star.glow === undefined ? classes.star : classes[star.glow],
          star.wide && classes.wide,
        )}
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
    <svg viewBox="0 0 240 240" className={classes.constellation}>
      <Constellation linesClassName={classes.lines} />
    </svg>
  </div>
)
