import { IconPencil, IconRefresh, IconTrash } from '@tabler/icons-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { moneyLabelOf } from '@/formatting/labels'
import { ActionMenu } from '@/ui/components/ActionMenu'
import { Badge } from '@/ui/components/Badge'
import { Button } from '@/ui/components/Button'
import { Modal } from '@/ui/components/Modal'
import { PriorityDots } from '@/ui/components/PriorityDots'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import { removePhoto } from '@/wishlist/api/photos'
import { deleteItem, markAvailable, wishlistQuery, type Item } from '@/wishlist/api/wishlist'
import { ItemThumb } from '../ItemThumb'
import classes from './WishlistItem.module.css'

type Props = {
  item: Item
}

const priorityLabels = [
  'wishlist.list.priority.1',
  'wishlist.list.priority.2',
  'wishlist.list.priority.3',
] as const

export const WishlistItem = ({ item }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [deleteOpened, deleteDialog] = useDisclosure(false)

  const refresh = () => queryClient.invalidateQueries(wishlistQuery)

  const restore = useMutation({ mutationFn: () => markAvailable(item.id), onSuccess: refresh })

  const remove = useMutation({
    mutationFn: async () => {
      await deleteItem(item.id)

      // The item is gone either way; a photo left in storage is invisible and harmless.
      if (item.photoPath !== null) await removePhoto(item.photoPath).catch(() => undefined)
    },
    onSuccess: async () => {
      deleteDialog.close()
      await refresh()
    },
  })

  const edit = () => void navigate({ to: '/wishlist/$itemId/edit', params: { itemId: item.id } })

  return (
    <article data-surface className={classes.root}>
      <ItemThumb photoPath={item.photoPath} />
      <div className={classes.details}>
        <span className={classes.name}>{item.name}</span>
        <span className={classes.meta}>
          {item.price === null ? null : (
            <>
              {t('wishlist.list.price', { price: moneyLabelOf(item.price) })}
              <span aria-hidden>·</span>
            </>
          )}
          {item.isPurchased ? (
            <Badge>{t('wishlist.list.purchased')}</Badge>
          ) : (
            <PriorityDots
              label={t(priorityLabels[item.priority - 1] ?? priorityLabels[1])}
              value={item.priority}
            />
          )}
        </span>
      </div>
      <ActionMenu label={t('wishlist.list.more')}>
        {item.isPurchased ? (
          <ActionMenu.Item
            icon={<IconRefresh stroke={1.8} aria-hidden />}
            onClick={() => restore.mutate()}
          >
            {t('wishlist.list.markAvailable')}
          </ActionMenu.Item>
        ) : null}
        <ActionMenu.Item icon={<IconPencil stroke={1.8} aria-hidden />} onClick={edit}>
          {t('wishlist.list.edit')}
        </ActionMenu.Item>
        <ActionMenu.Item
          icon={<IconTrash stroke={1.8} aria-hidden />}
          danger
          onClick={deleteDialog.open}
        >
          {t('wishlist.list.delete')}
        </ActionMenu.Item>
      </ActionMenu>
      <Modal
        opened={deleteOpened}
        title={t('wishlist.list.deleteDialog.title')}
        onClose={deleteDialog.close}
      >
        {t('wishlist.list.deleteDialog.body', { name: item.name })}
        <Modal.Actions>
          <Button variant="secondary" size="md" onClick={deleteDialog.close}>
            {t('wishlist.list.deleteDialog.cancel')}
          </Button>
          <Button size="md" loading={remove.isPending} onClick={() => remove.mutate()}>
            {t('wishlist.list.deleteDialog.confirm')}
          </Button>
        </Modal.Actions>
      </Modal>
    </article>
  )
}
