import { IconGift } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { photoUrlQuery } from '@/wishlist/api/photos'
import classes from './ItemThumb.module.css'

type Props = {
  photoPath: string | null
  className?: string
}

export const ItemThumb = ({ photoPath, className }: Props) => {
  const { data: url } = useQuery({
    ...photoUrlQuery(photoPath ?? ''),
    enabled: photoPath !== null,
  })

  return (
    <span className={clsx(classes.root, className)}>
      {url === undefined ? (
        <IconGift stroke={1.6} aria-hidden className={classes.icon} />
      ) : (
        <>
          <img src={url} alt="" aria-hidden className={classes.backdrop} />
          <img src={url} alt="" className={classes.photo} />
        </>
      )}
    </span>
  )
}
