import { Link } from '@tanstack/react-router'
import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { moneyLabelOf } from '@/formatting/labels'
import { PriorityDots } from '@/ui/components/PriorityDots'
import type { ItemFields } from '@/wishlist/api/wishlist'
import { priorityLevelOf } from '@/wishlist/utils/priority-level-of'
import { ItemThumb } from '../ItemThumb'
import classes from './ItemCard.module.css'

type Props = {
  item: ItemFields & { id: string }
  /** Makes the whole card a link to the item's edit form. */
  editable?: boolean
  /** Sits under the details. */
  children?: ReactNode
}

/** One part of the line under the item's name, keyed by what it is since any may be missing. */
type Detail = {
  key: 'price' | 'url' | 'note'
  content: ReactNode
}

export const ItemCard = ({ item, editable = false, children }: Props) => {
  const { t } = useTranslation()

  const allDetails: Detail[] = [
    {
      key: 'price',
      content:
        item.price === null ? null : t('wishlist.item.price', { price: moneyLabelOf(item.price) }),
    },
    {
      key: 'url',
      content:
        item.url === null ? null : (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className={classes.link}>
            {t('wishlist.item.openLink')}
          </a>
        ),
    },
    { key: 'note', content: item.note },
  ]
  const details = allDetails.filter((detail) => detail.content !== null)

  return (
    <article data-surface className={classes.root}>
      <div className={classes.media}>
        <ItemThumb photoPath={item.photoPath} className={classes.thumb} />
        <span className={classes.priority}>
          <PriorityDots
            label={t(`wishlist.item.priority.${priorityLevelOf(item.priority)}`)}
            value={item.priority}
          />
        </span>
      </div>
      <div className={classes.body}>
        <h3 className={classes.name}>
          {editable ? (
            <Link to="/wishlist/$itemId/edit" params={{ itemId: item.id }} className={classes.edit}>
              {item.name}
            </Link>
          ) : (
            item.name
          )}
        </h3>
        {details.length === 0 ? null : (
          <p className={classes.details}>
            {details.map((detail, index) => (
              <Fragment key={detail.key}>
                {index === 0 ? null : ' · '}
                {detail.content}
              </Fragment>
            ))}
          </p>
        )}
        {children}
      </div>
    </article>
  )
}
