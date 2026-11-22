import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ImagePicker } from '@/ui/components/ImagePicker'
import { maxPhotoBytes, photoTypes } from '@/wishlist/constants/photos'
import { usePhotoPreview } from '@/wishlist/hooks/use-photo-preview'
import type { Photo } from '@/wishlist/utils/draft'
import classes from './PhotoField.module.css'

type Props = {
  photo: Photo
  onChange: (photo: Photo) => void
}

type Rejection = 'photoType' | 'photoSize'

const rejectionOf = (file: File): Rejection | null => {
  if (!photoTypes.includes(file.type)) return 'photoType'

  return file.size > maxPhotoBytes ? 'photoSize' : null
}

export const PhotoField = ({ photo, onChange }: Props) => {
  const { t } = useTranslation()
  const preview = usePhotoPreview(photo)
  const [rejection, setRejection] = useState<Rejection | null>(null)

  const pick = (file: File) => {
    const reason = rejectionOf(file)

    setRejection(reason)

    if (reason === null) onChange({ kind: 'picked', file })
  }

  return (
    <div className={classes.root}>
      <span className={classes.label}>{t('wishlist.form.photo')}</span>
      <ImagePicker
        accept={photoTypes.join(',')}
        hasImage={photo.kind !== 'none'}
        src={preview}
        pickLabel={t('wishlist.form.addPhoto')}
        replaceLabel={t('wishlist.form.replacePhoto')}
        removeLabel={t('wishlist.form.removePhoto')}
        onPick={pick}
        onRemove={() => onChange({ kind: 'none' })}
      />
      {rejection === null ? null : (
        <p role="alert" className={classes.error}>
          {t(`wishlist.form.errors.${rejection}`)}
        </p>
      )}
    </div>
  )
}
