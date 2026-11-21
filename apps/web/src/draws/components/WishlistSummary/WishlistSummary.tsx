import { IconGift, IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/ui/components/ButtonLink'
import { Card } from '@/ui/components/Card'
import { Heading } from '@/ui/components/Heading'
import { wishlistQuery } from '@/wishlist/api/wishlist'
import classes from './WishlistSummary.module.css'

export const WishlistSummary = () => {
  const { t } = useTranslation()
  const { data: items } = useSuspenseQuery(wishlistQuery)

  if (items.length === 0) {
    return (
      <Card quiet className={classes.empty}>
        <span className={classes.mark}>
          <IconGift stroke={1.8} aria-hidden />
        </span>
        <Heading order={3} size="sm">
          {t('draws.wishlistSummary.emptyTitle')}
        </Heading>
        <p className={classes.body}>{t('draws.wishlistSummary.emptyBody')}</p>
        <ButtonLink
          icon={<IconPlus stroke={2} />}
          renderLink={(props) => <Link {...props} to="/" />}
        >
          {t('draws.wishlistSummary.add')}
        </ButtonLink>
      </Card>
    )
  }

  return (
    <Card quiet className={classes.summary}>
      <span className={classes.mark}>
        <IconGift stroke={1.8} aria-hidden />
      </span>
      <span className={classes.text}>
        <span className={classes.count}>
          {t('draws.wishlistSummary.count', { count: items.length })}
        </span>
        <span className={classes.hint}>{t('draws.wishlistSummary.hint')}</span>
      </span>
      <Link to="/" className={classes.edit}>
        {t('draws.wishlistSummary.edit')}
      </Link>
    </Card>
  )
}
