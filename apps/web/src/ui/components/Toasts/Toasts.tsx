import { Notifications } from '@mantine/notifications'
import classes from './Toasts.module.css'

/** Where every toast appears; rendered once, by `UiProvider`. */
export const Toasts = () => (
  <Notifications position="top-center" classNames={{ root: classes.root }} />
)
