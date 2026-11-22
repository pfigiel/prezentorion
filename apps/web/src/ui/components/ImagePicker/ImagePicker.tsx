import { ActionIcon, FileButton } from '@mantine/core'
import { IconPencil, IconPhoto, IconTrash } from '@tabler/icons-react'
import classes from './ImagePicker.module.css'

type Props = {
  /** Comma-separated media types, as the `accept` attribute takes them. */
  accept: string
  hasImage: boolean
  /** Undefined while a chosen image is still loading. */
  src?: string
  pickLabel: string
  replaceLabel: string
  removeLabel: string
  onPick: (file: File) => void
  onRemove: () => void
}

/** A square that opens the system file chooser, then shows the image with controls on top. */
export const ImagePicker = ({
  accept,
  hasImage,
  src,
  pickLabel,
  replaceLabel,
  removeLabel,
  onPick,
  onRemove,
}: Props) => {
  const pick = (file: File | null) => {
    if (file !== null) onPick(file)
  }

  if (!hasImage) {
    return (
      <FileButton accept={accept} onChange={pick}>
        {(props) => (
          <button type="button" className={classes.empty} {...props}>
            <IconPhoto stroke={1.8} aria-hidden />
            <span>{pickLabel}</span>
          </button>
        )}
      </FileButton>
    )
  }

  return (
    <div className={classes.frame}>
      {src === undefined ? null : (
        <>
          <img src={src} alt="" aria-hidden className={classes.backdrop} />
          <img src={src} alt="" className={classes.image} />
        </>
      )}
      <div className={classes.controls}>
        <FileButton accept={accept} onChange={pick}>
          {(props) => (
            <ActionIcon aria-label={replaceLabel} className={classes.control} {...props}>
              <IconPencil stroke={1.8} aria-hidden />
            </ActionIcon>
          )}
        </FileButton>
        <ActionIcon aria-label={removeLabel} className={classes.control} onClick={onRemove}>
          <IconTrash stroke={1.8} aria-hidden />
        </ActionIcon>
      </div>
    </div>
  )
}
