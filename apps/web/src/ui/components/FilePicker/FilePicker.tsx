import { FileButton } from '@mantine/core'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './FilePicker.module.css'

export type Props = {
  /** Comma-separated media types, as the `accept` attribute takes them. */
  accept: string
  icon?: ReactNode
  className?: string
  children: ReactNode
  onPick: (file: File) => void
}

/** A dashed button that opens the system file chooser. */
export const FilePicker = ({ accept, icon, className, children, onPick }: Props) => {
  const pick = (file: File | null) => {
    if (file !== null) onPick(file)
  }

  return (
    <FileButton accept={accept} onChange={pick}>
      {(props) => (
        <button type="button" className={clsx(classes.root, className)} {...props}>
          {icon}
          {children}
        </button>
      )}
    </FileButton>
  )
}
