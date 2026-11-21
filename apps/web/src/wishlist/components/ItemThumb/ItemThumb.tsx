import { IconGift } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { photoUrlQuery } from '@/wishlist/api/photos'
import classes from './ItemThumb.module.css'

type Props = {
  photoPath: string | null
}

export const ItemThumb = ({ photoPath }: Props) => {
  const { data: url } = useQuery({
    ...photoUrlQuery(photoPath ?? ''),
    enabled: photoPath !== null,
  })

  return (
    <span className={classes.root}>
      {url === undefined ? (
        <IconGift stroke={1.6} aria-hidden className={classes.icon} />
      ) : (
        <img src={url} alt="" className={classes.photo} />
      )}
    </span>
  )
}
