import { Radio } from '@mantine/core'
import classes from './RadioCards.module.css'

type Option<Value extends string> = {
  value: Value
  label: string
  description: string
}

export type Props<Value extends string> = {
  label: string
  value: Value
  options: Option<Value>[]
  disabled?: boolean
  hint?: string
  onChange: (value: Value) => void
}

/** One of a few choices, each a card explaining what picking it means. */
export const RadioCards = <Value extends string>({
  label,
  value,
  options,
  disabled,
  hint,
  onChange,
}: Props<Value>) => {
  const pick = (picked: string) => {
    const option = options.find((candidate) => candidate.value === picked)

    if (option !== undefined) onChange(option.value)
  }

  return (
    <Radio.Group
      label={label}
      description={hint}
      value={value}
      classNames={{ label: classes.label, description: classes.hint }}
      onChange={pick}
    >
      <div className={classes.options}>
        {options.map((option) => (
          <Radio.Card
            key={option.value}
            value={option.value}
            disabled={disabled}
            className={classes.card}
          >
            <Radio.Indicator
              disabled={disabled}
              classNames={{ indicator: classes.indicator, icon: classes.icon }}
            />
            <span className={classes.text}>
              <span className={classes.title}>{option.label}</span>
              <span className={classes.description}>{option.description}</span>
            </span>
          </Radio.Card>
        ))}
      </div>
    </Radio.Group>
  )
}
