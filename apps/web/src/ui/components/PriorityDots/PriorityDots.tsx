import clsx from 'clsx'
import classes from './PriorityDots.module.css'

export type Props = {
  /** Names the priority in words for assistive technology. */
  label: string
  value: number
}

const levels = [1, 2, 3] as const

export const PriorityDots = ({ label, value }: Props) => (
  <span role="img" aria-label={label} className={classes.root}>
    {levels.map((level) => (
      <i key={level} className={clsx(classes.dot, level <= value && classes.on)} />
    ))}
  </span>
)
