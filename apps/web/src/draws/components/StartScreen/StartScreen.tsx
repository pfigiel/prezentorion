import { IconStars } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { accountQuery } from '@/account/api/account-query'
import { drawsQuery } from '@/draws/api/draws'
import { ManagedLists } from '@/managers/components/ManagedLists'
import { Card } from '@/ui/components/Card'
import { Heading } from '@/ui/components/Heading'
import { SectionLabel } from '@/ui/components/SectionLabel'
import { DrawCard } from '../DrawCard'
import { WishlistSummary } from '../WishlistSummary'
import classes from './StartScreen.module.css'

export const StartScreen = () => {
  const { t } = useTranslation()
  const { data: account } = useSuspenseQuery(accountQuery)
  const { data: draws } = useSuspenseQuery(drawsQuery)

  return (
    <>
      <Heading order={1}>{t('draws.start.greeting', { name: account.name })}</Heading>
      <SectionLabel>{t('draws.start.draws')}</SectionLabel>
      {draws.length === 0 ? (
        <Card quiet className={classes.empty}>
          <IconStars stroke={1.6} aria-hidden className={classes.emptyIcon} />
          <Heading order={3} size="sm">
            {t('draws.empty.title')}
          </Heading>
          <p className={classes.emptyBody}>{t('draws.empty.body')}</p>
        </Card>
      ) : (
        draws.map((draw) => <DrawCard key={draw.id} draw={draw} />)
      )}
      <SectionLabel>{t('draws.start.wishlist')}</SectionLabel>
      <WishlistSummary />
      <ManagedLists />
    </>
  )
}
