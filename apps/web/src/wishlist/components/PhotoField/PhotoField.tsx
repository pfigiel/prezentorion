import { IconPhoto } from '@tabler/icons-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/components/Button'
import { FilePicker } from '@/ui/components/FilePicker'
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
  const hasPhoto = photo.kind !== 'none'

  const pick = (file: File) => {
    const reason = rejectionOf(file)

    setRejection(reason)

    if (reason === null) onChange({ kind: 'picked', file })
  }

  const icon = <IconPhoto stroke={1.8} aria-hidden />

  return (
    <div className={classes.root}>
      <span className={classes.label}>{t('wishlist.form.photo')}</span>
      {hasPhoto ? (
        <>
          {preview === undefined ? (
            <span className={classes.preview} />
          ) : (
            <img src={preview} alt="" className={classes.preview} />
          )}
          <div className={classes.actions}>
            <FilePicker
              accept={photoTypes.join(',')}
              icon={icon}
              className={classes.replace}
              onPick={pick}
            >
              {t('wishlist.form.replacePhoto')}
            </FilePicker>
            <Button variant="secondary" size="md" onClick={() => onChange({ kind: 'none' })}>
              {t('wishlist.form.removePhoto')}
            </Button>
          </div>
        </>
      ) : (
        <FilePicker accept={photoTypes.join(',')} icon={icon} onPick={pick}>
          {t('wishlist.form.addPhoto')}
        </FilePicker>
      )}
      {rejection === null ? null : (
        <p role="alert" className={classes.error}>
          {t(`wishlist.form.errors.${rejection}`)}
        </p>
      )}
    </div>
  )
}
