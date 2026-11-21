import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { photoUrlQuery } from '@/wishlist/api/photos'
import type { Photo } from '@/wishlist/utils/draft'

/** A URL to show the photo by: a signed one for a stored photo, a local one for a picked file. */
export const usePhotoPreview = (photo: Photo) => {
  const storedPath = photo.kind === 'stored' ? photo.path : null
  const pickedFile = photo.kind === 'picked' ? photo.file : null

  const { data: storedUrl } = useQuery({
    ...photoUrlQuery(storedPath ?? ''),
    enabled: storedPath !== null,
  })

  const pickedUrl = useMemo(
    () => (pickedFile === null ? undefined : URL.createObjectURL(pickedFile)),
    [pickedFile],
  )

  useEffect(
    () => () => {
      if (pickedUrl !== undefined) URL.revokeObjectURL(pickedUrl)
    },
    [pickedUrl],
  )

  return pickedFile === null ? (storedPath === null ? undefined : storedUrl) : pickedUrl
}
