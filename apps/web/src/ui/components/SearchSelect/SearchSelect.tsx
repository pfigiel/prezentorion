import { Combobox, InputBase, useCombobox } from '@mantine/core'
import { useEffect, type KeyboardEvent } from 'react'
import classes from './SearchSelect.module.css'

type Option = {
  value: string
  label: string
  description?: string
}

export type Props = {
  label: string
  query: string
  placeholder?: string
  /** Already narrowed to what matches `query`; the list shows them as they come. */
  options: Option[]
  nothingFound: string
  onQueryChange: (query: string) => void
  onPick: (value: string) => void
}

/** An input that lists every option as soon as it is focused, narrowed by what is typed into it. */
export const SearchSelect = ({
  label,
  query,
  placeholder,
  options,
  nothingFound,
  onQueryChange,
  onPick,
}: Props) => {
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() })
  const { selectFirstOption } = combobox

  // The best match stays highlighted, so Enter picks it without reaching for the arrow keys.
  useEffect(() => {
    if (query !== '') selectFirstOption()
  }, [selectFirstOption, query])

  // The list stays open after a pick, so several people are added without leaving the field.
  const pick = (picked: string) => {
    onPick(picked)
    combobox.resetSelectedOption()
  }

  const type = (typed: string) => {
    onQueryChange(typed)
    combobox.openDropdown()
  }

  // Enter that picks nothing must not submit the form around the input.
  const keepFormOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && combobox.getSelectedOptionIndex() === -1) {
      event.preventDefault()
    }
  }

  return (
    <Combobox
      store={combobox}
      classNames={{ dropdown: classes.dropdown, option: classes.option, empty: classes.empty }}
      onOptionSubmit={pick}
    >
      <Combobox.Target>
        <InputBase
          label={label}
          value={query}
          placeholder={placeholder}
          classNames={{ label: classes.label, input: classes.input }}
          onChange={(event) => type(event.currentTarget.value)}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={keepFormOnEnter}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options className={classes.options}>
          {options.length === 0 ? <Combobox.Empty>{nothingFound}</Combobox.Empty> : null}
          {options.map((option) => (
            <Combobox.Option key={option.value} value={option.value}>
              <span className={classes.optionLabel}>{option.label}</span>
              {option.description === undefined ? null : (
                <span className={classes.optionDescription}>{option.description}</span>
              )}
            </Combobox.Option>
          ))}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  )
}
