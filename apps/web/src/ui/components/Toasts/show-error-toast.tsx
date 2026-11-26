import { notifications } from '@mantine/notifications'
import { IconAlertCircle } from '@tabler/icons-react'
import classes from './Toasts.module.css'

type Toast = {
  message: string
  closeLabel: string
}

/** A message already on screen is not shown a second time, so a burst of failures leaves one toast. */
export const showErrorToast = ({ message, closeLabel }: Toast) =>
  notifications.show({
    id: message,
    message,
    icon: <IconAlertCircle stroke={1.8} aria-hidden />,
    closeButtonProps: { 'aria-label': closeLabel },
    classNames: {
      root: classes.toast,
      icon: classes.icon,
      description: classes.message,
      closeButton: classes.close,
    },
  })
