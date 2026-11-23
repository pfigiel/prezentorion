import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Hint } from '@/hints/components/Hint'
import { managedListQuery } from '@/managers/api/managers'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { isOnOffer } from '@/wishlist/utils/is-on-offer'
import { ManagedItem } from '../ManagedItem'
import classes from './ManagedListScreen.module.css'

type Props = {
  ownerId: string
}

export const ManagedListScreen = ({ ownerId }: Props) => {
  const { t } = useTranslation()
  const { data: list } = useSuspenseQuery(managedListQuery(ownerId))
  const availableCount = list.items.filter(isOnOffer).length

  return (
    <>
      <ScreenHeader title={list.owner.name} back={{ to: '/wishlist' }} />
      <Hint name="managedList">{t('managers.list.note')}</Hint>
      <SectionLabel>{t('managers.list.count', { count: availableCount })}</SectionLabel>
      {list.items.length === 0 ? (
        <p className={classes.empty}>{t('managers.list.empty')}</p>
      ) : (
        list.items.map((item) => <ManagedItem key={item.id} list={list} item={item} />)
      )}
    </>
  )
}
