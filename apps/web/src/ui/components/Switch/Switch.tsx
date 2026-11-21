import { Switch as MantineSwitch } from '@mantine/core'
import classes from './Switch.module.css'

export type Props = {
  label: string
  checked: boolean
  disabled?: boolean
  onChange: (checked: boolean) => void
}

export const Switch = ({ label, checked, disabled, onChange }: Props) => (
  <MantineSwitch
    label={label}
    checked={checked}
    disabled={disabled}
    classNames={{ body: classes.body, label: classes.label, track: classes.track }}
    onChange={(event) => onChange(event.currentTarget.checked)}
  />
)
