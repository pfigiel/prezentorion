import { Modal as MantineModal } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './Modal.module.css'

export type Props = {
  opened: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

type ActionsProps = {
  children: ReactNode
}

const Actions = ({ children }: ActionsProps) => <div className={classes.actions}>{children}</div>

export const Modal = ({ opened, title, children, onClose }: Props) => (
  <MantineModal
    opened={opened}
    title={title}
    centered
    classNames={{
      overlay: classes.overlay,
      content: classes.content,
      header: classes.header,
      title: classes.title,
      close: classes.close,
      body: classes.body,
    }}
    onClose={onClose}
  >
    {children}
  </MantineModal>
)

Modal.Actions = Actions
