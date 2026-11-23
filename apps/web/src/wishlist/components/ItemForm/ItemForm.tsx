import { IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Button } from '@/ui/components/Button'
import { IconButton } from '@/ui/components/IconButton'
import { PriorityInput } from '@/ui/components/PriorityInput'
import { Textarea } from '@/ui/components/Textarea'
import { TextInput } from '@/ui/components/TextInput'
import type { Item } from '@/wishlist/api/wishlist'
import { useSaveItem } from '@/wishlist/hooks/use-save-item'
import { draftOf, errorsOf, type Draft } from '@/wishlist/utils/draft'
import { DeleteItemButton } from '../DeleteItemButton'
import { MarkAvailableButton } from '../MarkAvailableButton'
import { PhotoField } from '../PhotoField'
import classes from './ItemForm.module.css'

type Props = {
  /** The item being edited; none for a new one. */
  item?: Item
}

export const ItemForm = ({ item }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const save = useSaveItem(item)
  const [draft, setDraft] = useState<Draft>(() => draftOf(item))
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? errorsOf(draft) : {}

  const change =
    <Key extends keyof Draft>(key: Key) =>
    (value: Draft[Key]) =>
      setDraft((current) => ({ ...current, [key]: value }))

  const close = () => void navigate({ to: '/wishlist' })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSubmitted(true)

    if (Object.keys(errorsOf(draft)).length === 0) save.mutate(draft)
  }

  return (
    <form className={classes.root} onSubmit={submit}>
      <ScreenHeader
        title={item === undefined ? t('wishlist.form.newTitle') : t('wishlist.form.editTitle')}
        action={
          <IconButton label={t('wishlist.form.cancel')} onClick={close}>
            <IconX stroke={1.8} aria-hidden />
          </IconButton>
        }
      />
      <TextInput
        label={t('wishlist.form.name')}
        placeholder={t('wishlist.form.namePlaceholder')}
        required
        value={draft.name}
        error={errors.name === undefined ? undefined : t('wishlist.form.errors.name')}
        onChange={change('name')}
      />
      <TextInput
        label={t('wishlist.form.url')}
        placeholder={t('wishlist.form.urlPlaceholder')}
        value={draft.url}
        error={errors.url === undefined ? undefined : t('wishlist.form.errors.url')}
        onChange={change('url')}
      />
      <TextInput
        label={t('wishlist.form.price')}
        inputMode="numeric"
        placeholder={t('wishlist.form.pricePlaceholder')}
        value={draft.price}
        error={errors.price === undefined ? undefined : t('wishlist.form.errors.price')}
        onChange={change('price')}
      />
      <Textarea
        label={t('wishlist.form.note')}
        placeholder={t('wishlist.form.notePlaceholder')}
        value={draft.note}
        onChange={change('note')}
      />
      <PriorityInput
        label={t('wishlist.form.priority')}
        value={draft.priority}
        levelLabelOf={(level) => t('wishlist.form.priorityLevel', { level })}
        onChange={change('priority')}
      />
      <PhotoField photo={draft.photo} onChange={change('photo')} />
      <div className={classes.actions}>
        <Button variant="secondary" onClick={close}>
          {t('wishlist.form.cancel')}
        </Button>
        <Button type="submit" loading={save.isPending}>
          {t('wishlist.form.save')}
        </Button>
      </div>
      {save.isError ? (
        <p role="alert" className={classes.error}>
          {t('wishlist.form.errors.save')}
        </p>
      ) : null}
      {item?.isPurchased ? <MarkAvailableButton item={item} /> : null}
      {item === undefined ? null : <DeleteItemButton item={item} />}
    </form>
  )
}
