import { Select as MantineSelect } from '@mantine/core'
import classes from './Select.module.css'

type Option = {
  value: string
  label: string
}

export type Props = {
  /** Names the field for assistive technology; on screen, the placeholder and the value speak. */
  label: string
  value: string | null
  options: Option[]
  placeholder?: string
  nothingFound: string
  error?: string
  onChange: (value: string) => void
}

/** Picks one of a fixed list, narrowed by typing into the field. */
export const Select = ({
  label,
  value,
  options,
  placeholder,
  nothingFound,
  error,
  onChange,
}: Props) => {
  const pick = (picked: string | null) => {
    if (picked !== null) onChange(picked)
  }

  return (
    <MantineSelect
      aria-label={label}
      value={value}
      data={options}
      placeholder={placeholder}
      nothingFoundMessage={nothingFound}
      error={error}
      searchable
      allowDeselect={false}
      withCheckIcon={false}
      classNames={{
        input: classes.input,
        error: classes.error,
        dropdown: classes.dropdown,
        option: classes.option,
        empty: classes.empty,
        section: classes.section,
      }}
      onChange={pick}
    />
  )
}
