import { Combobox, InputBase, useCombobox } from '@mantine/core'
import type { KeyboardEvent } from 'react'
import classes from './SuggestInput.module.css'

type Suggestion = {
  value: string
  label: string
  description?: string
}

export type Props = {
  label: string
  value: string
  placeholder?: string
  /** Already narrowed to what matches `value`; the input shows them as they come. */
  suggestions: Suggestion[]
  error?: string
  className?: string
  onChange: (value: string) => void
  /** Called with a picked suggestion's value, or with the typed text when Enter picks none. */
  onSubmit: (value: string) => void
}

/** A text input that offers matches as it is typed, while still taking text nothing matched. */
export const SuggestInput = ({
  label,
  value,
  placeholder,
  suggestions,
  error,
  className,
  onChange,
  onSubmit,
}: Props) => {
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() })

  const pick = (picked: string) => {
    onSubmit(picked)
    combobox.closeDropdown()
  }

  const type = (typed: string) => {
    onChange(typed)
    combobox.openDropdown()
    combobox.updateSelectedOptionIndex()
  }

  // Enter with no suggestion highlighted takes the typed text, and never submits a form around it.
  const submitTyped = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && combobox.getSelectedOptionIndex() === -1) {
      event.preventDefault()
      pick(value)
    }
  }

  return (
    <Combobox
      store={combobox}
      classNames={{ dropdown: classes.dropdown, option: classes.option }}
      onOptionSubmit={pick}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          value={value}
          placeholder={placeholder}
          error={error}
          className={className}
          classNames={{ label: classes.label, input: classes.input, error: classes.error }}
          onChange={(event) => type(event.currentTarget.value)}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={submitTyped}
        />
      </Combobox.Target>
      <Combobox.Dropdown hidden={suggestions.length === 0}>
        <Combobox.Options>
          {suggestions.map((suggestion) => (
            <Combobox.Option key={suggestion.value} value={suggestion.value}>
              <span className={classes.optionLabel}>{suggestion.label}</span>
              {suggestion.description === undefined ? null : (
                <span className={classes.optionDescription}>{suggestion.description}</span>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
