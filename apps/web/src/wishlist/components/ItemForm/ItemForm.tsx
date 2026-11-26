import { IconX } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScreenHeader } from '@/shell/components/ScreenHeader'
import { Button } from '@/ui/components/Button'
import { Form } from '@/ui/components/Form'
import { IconButton } from '@/ui/components/IconButton'
import { PriorityInput } from '@/ui/components/PriorityInput'
import { RadioCards } from '@/ui/components/RadioCards'
import { Textarea } from '@/ui/components/Textarea'
import { TextInput } from '@/ui/components/TextInput'
import type { Item } from '@/wishlist/api/wishlist'
import { maxLengths } from '@/wishlist/constants/items'
import { useSaveItem } from '@/wishlist/hooks/use-save-item'
import { draftOf, errorsOf, isValid, type Draft } from '@/wishlist/utils/draft'
import { DeleteItemButton } from '../DeleteItemButton'
import { MarkAvailableButton } from '../MarkAvailableButton'
import { PhotoField } from '../PhotoField'
import classes from './ItemForm.module.css'

type Props = {
  /** The item being edited; none for a new one. */
  item?: Item
}

const kinds = ['unique', 'repeatable'] as const

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

  const submit = () => {
    setSubmitted(true)

    if (isValid(errorsOf(draft))) save.mutate(draft)
  }

  return (
    <Form className={classes.root} onSubmit={submit}>
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
        error={
          errors.name === undefined
            ? undefined
            : t(`wishlist.form.errors.name.${errors.name}`, { max: maxLengths.name })
        }
        onChange={change('name')}
      />
      <TextInput
        label={t('wishlist.form.url')}
        placeholder={t('wishlist.form.urlPlaceholder')}
        value={draft.url}
        error={
          errors.url === undefined
            ? undefined
            : t(`wishlist.form.errors.url.${errors.url}`, { max: maxLengths.url })
        }
        onChange={change('url')}
      />
      <TextInput
        label={t('wishlist.form.price')}
        inputMode="numeric"
        placeholder={t('wishlist.form.pricePlaceholder')}
        value={draft.price}
        error={
          errors.price === undefined ? undefined : t(`wishlist.form.errors.price.${errors.price}`)
        }
        onChange={change('price')}
      />
      <Textarea
        label={t('wishlist.form.note')}
        placeholder={t('wishlist.form.notePlaceholder')}
        value={draft.note}
        error={
          errors.note === undefined
            ? undefined
            : t(`wishlist.form.errors.note.${errors.note}`, { max: maxLengths.note })
        }
        onChange={change('note')}
      />
      <PriorityInput
        label={t('wishlist.form.priority')}
        value={draft.priority}
        levelLabelOf={(level) => t('wishlist.form.priorityLevel', { level })}
        onChange={change('priority')}
      />
      <RadioCards
        label={t('wishlist.form.kind.label')}
        value={draft.repeatable ? 'repeatable' : 'unique'}
        options={kinds.map((kind) => ({
          value: kind,
          label: t(`wishlist.form.kind.${kind}.label`),
          description: t(`wishlist.form.kind.${kind}.description`),
        }))}
        onChange={(kind) => change('repeatable')(kind === 'repeatable')}
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
      {item?.isPurchased ? <MarkAvailableButton item={item} /> : null}
      {item === undefined ? null : <DeleteItemButton item={item} />}
    </Form>
  )
}
