import { Loader as MantineLoader } from '@mantine/core'
import classes from './Loader.module.css'

export type Props = {
  label: string
}

export const Loader = ({ label }: Props) => (
  <MantineLoader type="dots" role="progressbar" aria-label={label} className={classes.root} />
)
