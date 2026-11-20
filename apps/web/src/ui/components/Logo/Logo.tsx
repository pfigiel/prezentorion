import clsx from 'clsx'
import { ConstellationMark } from './ConstellationMark'
import { GiftMark } from './GiftMark'
import classes from './Logo.module.css'

type Size = 'md' | 'lg'

export type Props = {
  size?: Size
}

export const Logo = ({ size = 'md' }: Props) => {
  const Mark = size === 'lg' ? ConstellationMark : GiftMark

  return (
    <span className={clsx(classes.root, classes[size])}>
      <Mark className={classes.mark} />
      <span>
        Prezent<span className={classes.accent}>orion</span>
      </span>
    </span>
  )
}
