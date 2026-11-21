import { Progress as MantineProgress } from '@mantine/core'
import classes from './Progress.module.css'

export type Props = {
  label: string
  value: number
  max: number
}

export const Progress = ({ label, value, max }: Props) => (
  <MantineProgress
    aria-label={label}
    value={max === 0 ? 0 : (value / max) * 100}
    classNames={{ root: classes.track, section: classes.bar }}
  />
)
