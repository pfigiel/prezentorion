import { Textarea as MantineTextarea } from '@mantine/core'
import classes from './Textarea.module.css'

export type Props = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export const Textarea = ({ label, value, placeholder, onChange }: Props) => (
  <MantineTextarea
    label={label}
    value={value}
    placeholder={placeholder}
    autosize
    minRows={3}
    classNames={{ label: classes.label, input: classes.input }}
    onChange={(event) => onChange(event.currentTarget.value)}
  />
)
