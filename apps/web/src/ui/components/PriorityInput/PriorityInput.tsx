import clsx from 'clsx'
import classes from './PriorityInput.module.css'

export type Props = {
  label: string
  value: number
  /** Names one level for assistive technology, as in "Priorytet 2 z 3". */
  levelLabelOf: (level: number) => string
  onChange: (value: number) => void
}

const levels = [1, 2, 3] as const

/** Like a star rating: choosing a level lights every dot up to it. */
export const PriorityInput = ({ label, value, levelLabelOf, onChange }: Props) => (
  <div role="radiogroup" aria-label={label} className={classes.root}>
    <span className={classes.label}>{label}</span>
    <div className={classes.dots}>
      {levels.map((level) => (
        <button
          key={level}
          type="button"
          role="radio"
          aria-checked={level === value}
          aria-label={levelLabelOf(level)}
          className={classes.option}
          onClick={() => onChange(level)}
        >
          <span className={clsx(classes.dot, level <= value && classes.on)} />
        </button>
      ))}
    </div>
  </div>
)
