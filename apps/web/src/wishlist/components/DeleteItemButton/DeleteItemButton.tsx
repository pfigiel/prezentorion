import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/ui/components/Button'
import { Modal } from '@/ui/components/Modal'
import { useDisclosure } from '@/ui/hooks/use-disclosure'
import { removePhoto } from '@/wishlist/api/photos'
import { deleteItem, wishlistQuery, type Item } from '@/wishlist/api/wishlist'

type Props = {
  item: Item
}

export const DeleteItemButton = ({ item }: Props) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [dialogOpened, dialog] = useDisclosure(false)

  const remove = useMutation({
    mutationFn: async () => {
      await deleteItem(item.id)

      // The item is gone either way; a photo left in storage is invisible and harmless.
      if (item.photoPath !== null) await removePhoto(item.photoPath).catch(() => undefined)
    },
    onSuccess: async () => {
      await navigate({ to: '/wishlist' })
      await queryClient.invalidateQueries(wishlistQuery)
    },
  })

  return (
    <>
      <Button variant="danger" onClick={dialog.open}>
        {t('wishlist.form.delete')}
      </Button>
      <Modal
        opened={dialogOpened}
        title={t('wishlist.form.deleteDialog.title')}
        onClose={dialog.close}
      >
        {t('wishlist.form.deleteDialog.body', { name: item.name })}
        <Modal.Actions>
          <Button variant="secondary" size="md" onClick={dialog.close}>
            {t('wishlist.form.deleteDialog.cancel')}
          </Button>
          <Button size="md" loading={remove.isPending} onClick={() => remove.mutate()}>
            {t('wishlist.form.deleteDialog.confirm')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}
