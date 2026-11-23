import { IconChevronRight } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { managedListsQuery } from '@/managers/api/managers'
import { Avatar } from '@/ui/components/Avatar'
import { Card } from '@/ui/components/Card'
import { SectionLabel } from '@/ui/components/SectionLabel'
import classes from './ManagedLists.module.css'

export const ManagedLists = () => {
  const { t } = useTranslation()
  const { data: owners } = useSuspenseQuery(managedListsQuery)

  if (owners.length === 0) return null

  return (
    <>
      <SectionLabel>{t('managers.lists.title')}</SectionLabel>
      {owners.map((owner) => (
        <Card key={owner.id}>
          <Link
            to="/managed-lists/$ownerId"
            params={{ ownerId: owner.id }}
            className={classes.link}
          >
            <Avatar name={owner.name} pictureUrl={owner.pictureUrl} />
            <span className={classes.text}>
              <span className={classes.caption}>{t('managers.lists.caption')}</span>
              <span className={classes.name}>{owner.name}</span>
            </span>
            <IconChevronRight stroke={1.8} aria-hidden className={classes.chevron} />
          </Link>
        </Card>
      ))}
    </>
  )
}
