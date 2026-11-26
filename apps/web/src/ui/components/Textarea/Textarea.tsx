import { Textarea as MantineTextarea } from '@mantine/core'
import classes from './Textarea.module.css'

export type Props = {
  label: string
  value: string
  placeholder?: string
  error?: string
  onChange: (value: string) => void
}

export const Textarea = ({ label, value, placeholder, error, onChange }: Props) => (
  <MantineTextarea
    label={label}
    value={value}
    placeholder={placeholder}
    error={error}
    autosize
    minRows={3}
    classNames={{ label: classes.label, input: classes.input, error: classes.error }}
    onChange={(event) => onChange(event.currentTarget.value)}
  />
)
