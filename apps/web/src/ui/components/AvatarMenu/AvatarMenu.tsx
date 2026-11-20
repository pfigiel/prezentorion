import { Avatar, Menu, UnstyledButton } from '@mantine/core'
import type { ReactNode } from 'react'
import classes from './AvatarMenu.module.css'

export type Props = {
  /** Names the button for assistive technology; the picture alone says nothing. */
  label: string
  name: string
  pictureUrl: string | null
  children: ReactNode
}

type ItemProps = {
  children: ReactNode
  onClick: () => void
}

const Item = ({ children, onClick }: ItemProps) => (
  <Menu.Item className={classes.item} onClick={onClick}>
    {children}
  </Menu.Item>
)

export const AvatarMenu = ({ label, name, pictureUrl, children }: Props) => (
  <Menu position="bottom-end">
    <Menu.Target>
      <UnstyledButton aria-label={label} className={classes.trigger}>
        <Avatar src={pictureUrl} alt="" className={classes.avatar}>
          {name.charAt(0)}
        </Avatar>
      </UnstyledButton>
    </Menu.Target>
    <Menu.Dropdown className={classes.dropdown}>{children}</Menu.Dropdown>
  </Menu>
)

AvatarMenu.Item = Item
