import { TextInput as MantineTextInput } from '@mantine/core'
import classes from './TextInput.module.css'

export type Props = {
  label: string
  value: string
  type?: 'text' | 'email' | 'password' | 'url' | 'date'
  inputMode?: 'text' | 'numeric' | 'decimal'
  placeholder?: string
  autoComplete?: string
  required?: boolean
  error?: string
  onChange: (value: string) => void
}

export const TextInput = ({
  label,
  value,
  type = 'text',
  inputMode,
  placeholder,
  autoComplete,
  required,
  error,
  onChange,
}: Props) => (
  <MantineTextInput
    label={label}
    value={value}
    type={type}
    inputMode={inputMode}
    placeholder={placeholder}
    autoComplete={autoComplete}
    required={required}
    error={error}
    classNames={{ label: classes.label, input: classes.input, error: classes.error }}
    onChange={(event) => onChange(event.currentTarget.value)}
  />
)
