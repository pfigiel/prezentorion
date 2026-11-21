import { ActionIcon, Menu } from '@mantine/core'
import { IconDots } from '@tabler/icons-react'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import classes from './ActionMenu.module.css'

export type Props = {
  /** Names the button for assistive technology; the dots alone say nothing. */
  label: string
  children: ReactNode
}

type ItemProps = {
  icon?: ReactNode
  /** An action that destroys something, set apart in colour. */
  danger?: boolean
  children: ReactNode
  onClick: () => void
}

const Item = ({ icon, danger = false, children, onClick }: ItemProps) => (
  <Menu.Item
    leftSection={icon}
    className={clsx(classes.item, danger && classes.danger)}
    onClick={onClick}
  >
    {children}
  </Menu.Item>
)

export const ActionMenu = ({ label, children }: Props) => (
  <Menu position="bottom-end">
    <Menu.Target>
      <ActionIcon aria-label={label} className={classes.trigger}>
        <IconDots aria-hidden />
      </ActionIcon>
    </Menu.Target>
    <Menu.Dropdown className={classes.dropdown}>{children}</Menu.Dropdown>
  </Menu>
)

ActionMenu.Item = Item
